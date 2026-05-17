package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.entity.*;
import com.vibraguard.gateway.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/bi")
public class BIController {

    @Autowired
    private WorkOrderRepository workOrderRepository;
    @Autowired
    private AlertRepository alertRepository;
    @Autowired
    private SiteMtbfRepository siteMtbfRepository;
    @Autowired
    private MaintenanceCostRepository maintenanceCostRepository;
    @Autowired
    private InterventionRepository interventionRepository;
    @Autowired
    private KpiValueRepository kpiValueRepository;
    @Autowired
    private MotorRepository motorRepository;
    @Autowired
    private VibrationRepository vibrationRepository;

    @GetMapping("/kpis")
    public Mono<Map<String, Object>> getBIKPIs() {
        return Mono.fromCallable(() -> {
            List<Motor> allMotors = motorRepository.findAll();
            List<WorkOrder> allOrders = workOrderRepository.findAll();
            List<Alert> allAlerts = alertRepository.findAll();

            long totalMotors = allMotors.size();
            long criticalMotors = allMotors.stream()
                    .filter(m -> m.getEtatLabel() != null && (m.getEtatLabel().contains("Critique") || m.getEtatLabel().contains("Alerte")))
                    .count();
            
            long totalAlerts = allAlerts.size();
            long newAlerts = allAlerts.stream().filter(a -> "Nouveau".equalsIgnoreCase(a.getStatus())).count();

            List<VibrationData> recentVibs = vibrationRepository.findTop1000ByOrderByTimeDesc();
            long totalVibs = recentVibs.size();
            long anomalousVibs = recentVibs.stream().filter(VibrationData::isAnomalous).count();
            
            double availability = (totalVibs == 0) ? 100.0 : ((double) (totalVibs - anomalousVibs) / totalVibs) * 100.0;

            double totalCost = allOrders.stream().mapToDouble(WorkOrder::getCost).sum();

            // Calculate "pseudo-trends" or logic-based trends
            String uptimeTrend = (availability >= 100.0) ? "Optimal" : (availability >= 98.0 ? "+0.2%" : "-0.5%");
            boolean uptimeTrendUp = (availability >= 98.0);
            
            double criticalRatio = totalMotors == 0 ? 0 : (double) criticalMotors / totalMotors;
            String criticalTrend = (criticalMotors == 0) ? "Stable" : (criticalRatio > 0.1 ? "+2" : "-1");
            
            String alertsTrend = newAlerts > 0 ? "+" + newAlerts : "Aucune";

            // Calculate MTTR (Mean Time To Repair) from duration field and MTBF from order intervals
            List<WorkOrder> finishedOrders = allOrders.stream()
                    .filter(o -> o.getCompletedAt() != null && o.getCreatedAt() != null)
                    .collect(Collectors.toList());
            
            double avgMttrHours = 0.0;
            double avgMtbfHours = 0.0;
            if (!finishedOrders.isEmpty()) {
                java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                double totalDurationHours = 0;
                int durationCount = 0;
                List<WorkOrder> orderedByCompletedAt = finishedOrders.stream()
                        .sorted(Comparator.comparing(WorkOrder::getCompletedAt))
                        .collect(Collectors.toList());
                
                // Calculate MTTR from duration field
                for (WorkOrder wo : orderedByCompletedAt) {
                    if (wo.getDuration() != null && !wo.getDuration().trim().isEmpty()) {
                        try {
                            String dur = wo.getDuration().trim().toLowerCase();
                            double hours = 0;
                            if (dur.contains("h")) {
                                hours = Double.parseDouble(dur.replace("h", "").trim());
                            } else if (dur.contains("m")) {
                                double minutes = Double.parseDouble(dur.replace("m", "").trim());
                                hours = minutes / 60.0;
                            } else {
                                hours = Double.parseDouble(dur);
                            }
                            totalDurationHours += hours;
                            durationCount++;
                        } catch (NumberFormatException e) {
                            // ignore invalid duration
                        }
                    }
                }
                if (durationCount > 0) {
                    avgMttrHours = totalDurationHours / durationCount;
                }
                
                // Calculate MTBF from intervals between completed orders
                List<Long> mtbfIntervals = new ArrayList<>();
                WorkOrder previous = null;
                for (WorkOrder wo : orderedByCompletedAt) {
                    try {
                        Date start = sdf.parse(wo.getCreatedAt());
                        if (previous != null) {
                            Date previousEnd = sdf.parse(previous.getCompletedAt());
                            long intervalMinutes = (start.getTime() - previousEnd.getTime()) / (1000 * 60);
                            if (intervalMinutes >= 0) {
                                mtbfIntervals.add(intervalMinutes);
                            }
                        }
                        previous = wo;
                    } catch (Exception e) {
                        // ignore invalid dates
                    }
                }
                if (!mtbfIntervals.isEmpty()) {
                    long totalIntervalMinutes = mtbfIntervals.stream().mapToLong(Long::longValue).sum();
                    avgMtbfHours = (double) totalIntervalMinutes / (mtbfIntervals.size() * 60.0);
                }
            }

            Map<String, Object> kpis = new HashMap<>();
            kpis.put("totalMotors", totalMotors);
            kpis.put("totalMotorsTrend", "+0%");
            kpis.put("criticalMotors", criticalMotors);
            kpis.put("criticalMotorsTrend", criticalTrend);
            kpis.put("uptime", String.format("%.1f%%", availability));
            kpis.put("uptimeTrend", uptimeTrend);
            kpis.put("uptimeTrendUp", uptimeTrendUp);
            kpis.put("alerts", totalAlerts);
            kpis.put("alertsTrend", alertsTrend);
            
            kpis.put("mtbf", Math.round(avgMtbfHours * 10.0) / 10.0);
            kpis.put("mttr", Math.round(avgMttrHours * 10.0) / 10.0);
            kpis.put("totalCost", totalCost);
            kpis.put("activeWorkOrders", allOrders.stream().filter(o -> !"Terminé".equalsIgnoreCase(o.getStatus())).count());

            return kpis;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping("/kpis/upsert")
    public Mono<KpiValue> upsertKPI(@RequestBody KpiValue kpi) {
        return Mono.fromCallable(() -> {
            return kpiValueRepository.findById(kpi.getId()).map(existing -> {
                if (kpi.getNumericValue() != null) existing.setNumericValue(kpi.getNumericValue());
                if (kpi.getStringValue() != null) existing.setStringValue(kpi.getStringValue());
                if (kpi.getTrend() != null) existing.setTrend(kpi.getTrend());
                if (kpi.getTrendUp() != null) existing.setTrendUp(kpi.getTrendUp());
                return kpiValueRepository.save(existing);
            }).orElseGet(() -> kpiValueRepository.save(kpi));
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/mtbf-by-site")
    public Flux<SiteMtbf> getMtbfBySite() {
        return Flux.defer(() -> Flux.fromIterable(siteMtbfRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/maintenance-costs")
    public Flux<MaintenanceCost> getMaintenanceCosts() {
        return Flux.defer(() -> Flux.fromIterable(maintenanceCostRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/interventions")
    public Flux<Intervention> getInterventions() {
        return Flux.defer(() -> Flux.fromIterable(interventionRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/reports")
    public Mono<List<Map<String, Object>>> getBIReports() {
        return Mono.just(new ArrayList<>()); // Stub
    }
}
