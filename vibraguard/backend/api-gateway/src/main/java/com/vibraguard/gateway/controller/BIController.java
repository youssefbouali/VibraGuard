package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.entity.*;
import com.vibraguard.gateway.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/bi")
public class BIController {

    private static final List<DateTimeFormatter> DATE_FORMATTERS = List.of(
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"),
            DateTimeFormatter.ISO_LOCAL_DATE_TIME,
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS")
    );

    private static Date parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                LocalDateTime dateTime = LocalDateTime.parse(trimmed, formatter);
                return Date.from(dateTime.atZone(ZoneId.systemDefault()).toInstant());
            } catch (DateTimeParseException e) {
                // try next formatter
            }
        }
        return null;
    }

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
            long sitesConnected = allMotors.stream()
                    .map(Motor::getSite)
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .distinct()
                    .count();
            long activeAlerts = allAlerts.stream()
                    .filter(a -> a.getStatus() == null || !a.getStatus().equalsIgnoreCase("Acquittée"))
                    .count();

            // Calculate MTTR (Mean Time To Repair) from duration field and MTBF from order intervals
            List<WorkOrder> finishedOrders = allOrders.stream()
                    .filter(o -> o.getCompletedAt() != null && o.getCreatedAt() != null)
                    .collect(Collectors.toList());
            
            double avgMttrHours = 0.0;
            double avgMtbfHours = 0.0;
            if (!finishedOrders.isEmpty()) {
                double totalDurationHours = 0;
                int durationCount = 0;
                List<WorkOrder> orderedByCompletedAt = finishedOrders.stream()
                        .sorted(Comparator.comparing(WorkOrder::getCompletedAt))
                        .collect(Collectors.toList());
                
                // Calculate MTTR from duration field, supporting values like "10h 00m"
                for (WorkOrder wo : orderedByCompletedAt) {
                    if (wo.getDuration() != null && !wo.getDuration().trim().isEmpty()) {
                        try {
                            String dur = wo.getDuration().trim().toLowerCase();
                            double hours = 0;
                            java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("(?:(\\d+(?:\\.\\d+)?)h)?\\s*(?:(\\d+(?:\\.\\d+)?)m)?").matcher(dur);
                            if (matcher.matches()) {
                                if (matcher.group(1) != null) {
                                    hours += Double.parseDouble(matcher.group(1));
                                }
                                if (matcher.group(2) != null) {
                                    hours += Double.parseDouble(matcher.group(2)) / 60.0;
                                }
                            } else if (dur.contains("h") || dur.contains("m")) {
                                // fallback for slightly different formatting
                                String normalized = dur.replace("h", " h ").replace("m", " m ").trim();
                                String[] parts = normalized.split("\\s+");
                                for (int i = 0; i < parts.length - 1; i += 2) {
                                    String value = parts[i];
                                    String unit = parts[i + 1];
                                    if (unit.equals("h")) {
                                        hours += Double.parseDouble(value);
                                    } else if (unit.equals("m")) {
                                        hours += Double.parseDouble(value) / 60.0;
                                    }
                                }
                            } else {
                                hours = Double.parseDouble(dur);
                            }
                            if (hours >= 0) {
                                totalDurationHours += hours;
                                durationCount++;
                            }
                        } catch (NumberFormatException e) {
                            // ignore invalid duration
                        }
                    }
                }
                if (durationCount > 0) {
                    avgMttrHours = totalDurationHours / durationCount;
                } else {
                    // Fallback to created/completed timestamps when duration field cannot be parsed
                    long totalRepairMinutes = 0;
                    int repairCount = 0;
                    for (WorkOrder wo : orderedByCompletedAt) {
                        Date start = parseDate(wo.getCreatedAt());
                        Date end = parseDate(wo.getCompletedAt());
                        if (start != null && end != null) {
                            long repairMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
                            if (repairMinutes >= 0) {
                                totalRepairMinutes += repairMinutes;
                                repairCount++;
                            }
                        }
                    }
                    if (repairCount > 0) {
                        avgMttrHours = (double) totalRepairMinutes / (repairCount * 60.0);
                    }
                }
                
                // Calculate MTBF from intervals between completed orders
                List<Long> mtbfIntervals = new ArrayList<>();
                WorkOrder previous = null;
                for (WorkOrder wo : orderedByCompletedAt) {
                    Date start = parseDate(wo.getCreatedAt());
                    if (previous != null && start != null) {
                        Date previousEnd = parseDate(previous.getCompletedAt());
                        if (previousEnd != null) {
                            long intervalMinutes = (start.getTime() - previousEnd.getTime()) / (1000 * 60);
                            if (intervalMinutes >= 0) {
                                mtbfIntervals.add(intervalMinutes);
                            }
                        }
                    }
                    previous = wo;
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
            kpis.put("sitesConnected", sitesConnected);
            kpis.put("activeAlerts", activeAlerts);
            
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
    public Flux<Map<String, Object>> getMtbfBySite() {
        return Mono.fromCallable(() -> {
            List<Motor> allMotors = motorRepository.findAll();
            List<WorkOrder> allOrders = workOrderRepository.findAll();

            Map<String, List<Motor>> motorsBySite = allMotors.stream()
                    .filter(m -> m.getSite() != null && !m.getSite().trim().isEmpty())
                    .collect(Collectors.groupingBy(m -> m.getSite().trim()));

            String[] colors = {"#007A3D", "#D93F3F", "#F59E0B", "#3B82F6", "#8B5CF6",
                    "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16",
                    "#06B6D4", "#A855F7"};

            List<Map<String, Object>> result = new ArrayList<>();
            int colorIdx = 0;

            for (Map.Entry<String, List<Motor>> entry : motorsBySite.entrySet()) {
                String siteName = entry.getKey();
                Set<String> motorIds = entry.getValue().stream()
                        .map(Motor::getId)
                        .collect(Collectors.toSet());

                List<WorkOrder> siteOrders = allOrders.stream()
                        .filter(o -> o.getCompletedAt() != null && o.getCreatedAt() != null)
                        .filter(o -> motorIds.contains(o.getAsset()))
                        .sorted(Comparator.comparing(WorkOrder::getCompletedAt))
                        .collect(Collectors.toList());

                double avgMtbfHours = 0.0;
                if (siteOrders.size() >= 2) {
                    List<Long> intervals = new ArrayList<>();
                    WorkOrder previous = null;
                    for (WorkOrder wo : siteOrders) {
                        Date start = parseDate(wo.getCreatedAt());
                        if (previous != null && start != null) {
                            Date previousEnd = parseDate(previous.getCompletedAt());
                            if (previousEnd != null) {
                                long intervalMinutes = (start.getTime() - previousEnd.getTime()) / (1000 * 60);
                                if (intervalMinutes >= 0) {
                                    intervals.add(intervalMinutes);
                                }
                            }
                        }
                        previous = wo;
                    }
                    if (!intervals.isEmpty()) {
                        long totalMinutes = intervals.stream().mapToLong(Long::longValue).sum();
                        avgMtbfHours = (double) totalMinutes / (intervals.size() * 60.0);
                    }
                }

                Map<String, Object> siteMtbf = new HashMap<>();
                siteMtbf.put("name", siteName);
                siteMtbf.put("value", (int) Math.round(avgMtbfHours));
                siteMtbf.put("color", colors[colorIdx % colors.length]);
                result.add(siteMtbf);
                colorIdx++;
            }

            return result;
        }).flatMapMany(Flux::fromIterable)
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
