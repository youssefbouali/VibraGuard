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

            List<VibrationData> recentVibs = vibrationRepository.findTop1000ByOrderByIdDesc();
            long totalVibs = recentVibs.size();
            long anomalousVibs = recentVibs.stream().filter(VibrationData::isAnomalous).count();
            
            double availability = (totalVibs == 0) ? 100.0 : ((double) (totalVibs - anomalousVibs) / totalVibs) * 100.0;

            double totalCost = allOrders.stream().mapToDouble(WorkOrder::getCost).sum();

            // Calculate "pseudo-trends" or logic-based trends
            String uptimeTrend = (availability >= 100.0) ? "Optimal" : (availability >= 98.0 ? "+0.2%" : "-0.5%");
            boolean uptimeTrendUp = (availability >= 98.0);
            
            // For motors, trend could be based on critical count ratio
            double criticalRatio = totalMotors == 0 ? 0 : (double) criticalMotors / totalMotors;
            String criticalTrend = (criticalMotors == 0) ? "Stable" : (criticalRatio > 0.1 ? "+2" : "-1");
            
            // For alerts, trend could be based on new alerts count
            String alertsTrend = newAlerts > 0 ? "+" + newAlerts : "Aucune";

            Map<String, Object> kpis = new HashMap<>();
            kpis.put("totalMotors", totalMotors);
            kpis.put("totalMotorsTrend", "+0%"); // Motors don't change often
            kpis.put("criticalMotors", criticalMotors);
            kpis.put("criticalMotorsTrend", criticalTrend);
            kpis.put("uptime", String.format("%.1f%%", availability));
            kpis.put("uptimeTrend", uptimeTrend);
            kpis.put("uptimeTrendUp", uptimeTrendUp);
            kpis.put("alerts", totalAlerts);
            kpis.put("alertsTrend", alertsTrend);
            
            kpis.put("mtbf", 720.0); 
            kpis.put("mttr", 4.5);
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
