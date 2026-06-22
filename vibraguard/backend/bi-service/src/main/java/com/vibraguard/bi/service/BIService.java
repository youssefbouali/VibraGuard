package com.vibraguard.bi.service;

import com.vibraguard.bi.entity.KpiValue;
import com.vibraguard.bi.entity.MotorEntity;
import com.vibraguard.bi.entity.WorkOrder;
import com.vibraguard.bi.repository.KpiValueRepository;
import com.vibraguard.bi.repository.MotorRepository;
import com.vibraguard.bi.repository.WorkOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.Optional;
import java.util.stream.*;

@Service
public class BIService {

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private MotorRepository motorRepository;

    @Autowired
    private KpiValueRepository kpiValueRepository;

    @Value("${motor-service.url:http://motor-service.vibraguard.svc.cluster.local:8082}")
    private String motorServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String[] SITE_COLORS = {"#3B82F6", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"};
    private static final DateTimeFormatter[] DATE_PARSERS = {
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd")
    };

    public List<Map<String, Object>> getInterventions() {
        List<WorkOrder> all = workOrderRepository.findAll();
        Map<String, Long> counts = all.stream()
                .filter(wo -> wo.getType() != null)
                .collect(Collectors.groupingBy(WorkOrder::getType, Collectors.counting()));

        Map<String, String> colorMap = new HashMap<>();
        colorMap.put("Pr\u00e9ventif", "#10B981");
        colorMap.put("Correctif", "#EF4444");

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Long> entry : counts.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("type", entry.getKey());
            item.put("value", entry.getValue().intValue());
            item.put("color", colorMap.getOrDefault(entry.getKey(), "#6B7280"));
            result.add(item);
        }
        return result;
    }

    public List<Map<String, Object>> getMtbfBySite() {
        List<MotorEntity> motors = motorRepository.findAll();
        List<WorkOrder> allWO = workOrderRepository.findAll();

        Map<String, String> motorToSite = new HashMap<>();
        for (MotorEntity m : motors) {
            if (m.getId() == null) continue;
            String site = resolveSite(m);
            motorToSite.put(m.getId(), site);
        }

        Map<String, List<WorkOrder>> correctiveBySite = new HashMap<>();
        for (WorkOrder wo : allWO) {
            if (wo.getType() == null || !wo.getType().equals("Correctif")) continue;
            if (wo.getAsset() == null) continue;
            String site = motorToSite.get(wo.getAsset());
            if (site != null) {
                correctiveBySite.computeIfAbsent(site, k -> new ArrayList<>()).add(wo);
            }
        }

        Set<String> allSites = new LinkedHashSet<>(motorToSite.values());

        int colorIdx = 0;
        List<Map<String, Object>> result = new ArrayList<>();
        for (String site : allSites) {
            List<WorkOrder> wos = correctiveBySite.getOrDefault(site, Collections.emptyList());
            double siteMtbf = calculateSiteMtbf(wos);

            Map<String, Object> item = new HashMap<>();
            item.put("name", site);
            item.put("value", Math.round(siteMtbf * 10.0) / 10.0);
            item.put("color", SITE_COLORS[colorIdx % SITE_COLORS.length]);
            colorIdx++;
            result.add(item);
        }

        result.sort((a, b) -> ((String) a.get("name")).compareTo((String) b.get("name")));
        return result;
    }

    private String resolveSite(MotorEntity m) {
        if (m.getSite() != null && !m.getSite().trim().isEmpty()) return m.getSite().trim();
        if (m.getLocalisation() != null && !m.getLocalisation().trim().isEmpty()) return m.getLocalisation().trim();
        return "Site Principal";
    }

    private double calculateSiteMtbf(List<WorkOrder> wos) {
        List<Instant> timestamps = new ArrayList<>();
        for (WorkOrder wo : wos) {
            String dateStr = wo.getDueDate() != null ? wo.getDueDate() : wo.getCreatedAt();
            if (dateStr == null) continue;
            Instant ts = parseDateFlexible(dateStr);
            if (ts != null) timestamps.add(ts);
        }

        if (timestamps.size() < 2) {
            if (timestamps.size() == 1) {
                long msSince = java.time.Instant.now().toEpochMilli() - timestamps.get(0).toEpochMilli();
                return msSince > 0 ? msSince / (1000.0 * 3600.0) : 0.0;
            }
            return 0.0;
        }

        Collections.sort(timestamps);

        double totalHours = 0.0;
        int intervals = 0;
        for (int i = 1; i < timestamps.size(); i++) {
            long diffMs = timestamps.get(i).toEpochMilli() - timestamps.get(i - 1).toEpochMilli();
            if (diffMs > 0) {
                totalHours += diffMs / (1000.0 * 3600.0);
                intervals++;
            }
        }
        return intervals > 0 ? totalHours / intervals : 0.0;
    }

    private Instant parseDateFlexible(String dateStr) {
        if (dateStr == null) return null;
        String trimmed = dateStr.trim();
        for (DateTimeFormatter fmt : DATE_PARSERS) {
            try {
                LocalDateTime ldt = LocalDateTime.parse(trimmed, fmt);
                return ldt.atZone(ZoneId.systemDefault()).toInstant();
            } catch (DateTimeParseException e) {
                // try next format
            }
        }
        return null;
    }

    public double calculateMTTR() {
        List<WorkOrder> correctiveCompleted = workOrderRepository.findAll().stream()
                .filter(wo -> "Correctif".equals(wo.getType()))
                .filter(wo -> wo.getDuration() != null && !wo.getDuration().isEmpty())
                .collect(Collectors.toList());

        if (correctiveCompleted.isEmpty()) return 0.0;

        double totalHours = 0.0;
        int count = 0;

        for (WorkOrder wo : correctiveCompleted) {
            try {
                double h = parseDuration(wo.getDuration());
                if (h > 0) {
                    totalHours += h;
                    count++;
                }
            } catch (Exception e) {
                // skip invalid durations
            }
        }

        return count > 0 ? Math.round((totalHours / count) * 10.0) / 10.0 : 0.0;
    }

    private double parseDuration(String duration) {
        if (duration == null || duration.isEmpty()) return 0.0;
        double hours = 0.0;
        String d = duration.toLowerCase().replaceAll("\\s+", "");
        if (d.contains("h")) {
            int hIdx = d.indexOf("h");
            hours += Double.parseDouble(d.substring(0, hIdx));
            d = d.substring(hIdx + 1);
        }
        if (d.contains("m")) {
            int mIdx = d.indexOf("m");
            hours += Double.parseDouble(d.substring(0, mIdx)) / 60.0;
        }
        return hours;
    }

    public Map<String, Object> getBIKPIs() {
        List<WorkOrder> allWO = workOrderRepository.findAll();
        List<MotorEntity> allMotors = motorRepository.findAll();

        long correctiveCount = allWO.stream().filter(wo -> "Correctif".equals(wo.getType())).count();
        long preventiveCount = allWO.stream().filter(wo -> "Pr\u00e9ventif".equals(wo.getType())).count();
        long activeCount = allWO.stream()
                .filter(wo -> wo.getStatus() != null
                        && !"Termin\u00e9".equals(wo.getStatus())
                        && !"Annul\u00e9".equals(wo.getStatus()))
                .count();

        double totalCost = allWO.stream().mapToDouble(WorkOrder::getCost).sum();

        double overallMttr = calculateMTTR();
        double overallMtbf = calculateOverallMtbf(allWO, allMotors);

        long sitesCount = allMotors.stream()
                .map(m -> resolveSite(m))
                .distinct()
                .count();

        // Fetch actual motor health data from motor-service for real calculations
        int criticalMotors = 0;
        int totalMotors = allMotors.size();
        double avgHealth = 100.0;
        int alertsCount = 0;
        try {
            Map[] motors = restTemplate.getForObject(motorServiceUrl + "/api/v1/iot/motors", Map[].class);
            if (motors != null) {
                totalMotors = motors.length;
                double healthSum = 0;
                for (Map m : motors) {
                    String etatLabel = (String) m.get("etatLabel");
                    Object etatPct = m.get("etatPct");
                    boolean isCritical = etatPct instanceof Number && ((Number) etatPct).doubleValue() < 50;
                    if (isCritical) criticalMotors++;
                    if (etatPct instanceof Number) {
                        healthSum += ((Number) etatPct).doubleValue();
                    } else {
                        healthSum += 100;
                    }
                    // Count alerts from motor health: if motor is in Attention or Critique with recent alert
                    if (isCritical || (etatLabel != null && etatLabel.contains("Attention"))) {
                        alertsCount++;
                    }
                }
                avgHealth = totalMotors > 0 ? healthSum / totalMotors : 100;
            }
        } catch (Exception e) {
            // Fallback: use KPI_VALUES if motor-service unreachable
            Optional<KpiValue> uptimeKpi = kpiValueRepository.findById("uptime");
            if (uptimeKpi.isPresent() && uptimeKpi.get().getNumericValue() != null) {
                avgHealth = uptimeKpi.get().getNumericValue();
            }
        }

        double uptimePct2 = Math.max(0, Math.min(100, avgHealth));

        Map<String, Object> kpis = new HashMap<>();
        kpis.put("totalMotors", totalMotors);
        kpis.put("totalMotorsTrend", totalMotors > 0 ? "+" + totalMotors : "0");
        kpis.put("criticalMotors", criticalMotors);
        kpis.put("criticalMotorsTrend", criticalMotors > 0 ? criticalMotors + " en alerte" : "Stable");
        kpis.put("uptime", String.format("%.1f%%", uptimePct2));
        kpis.put("uptimeTrend", uptimePct2 >= 99 ? "Optimal" : uptimePct2 >= 95 ? "Bon" : "Attention");
        kpis.put("uptimeTrendUp", true);
        kpis.put("alerts", alertsCount);
        kpis.put("alertsTrend", alertsCount > 0 ? alertsCount + " active(s)" : "Aucune");
        kpis.put("sitesConnected", (int) sitesCount);
        kpis.put("activeAlerts", alertsCount);
        kpis.put("mtbf", overallMtbf);
        kpis.put("mtbfTrend", overallMtbf > 500 ? "Optimal" : overallMtbf > 200 ? "Bon" : "Surveillance");
        kpis.put("mtbfUp", overallMtbf > 0);
        kpis.put("mttr", overallMttr);
        kpis.put("mttrTrend", overallMttr > 0 && overallMttr < 24 ? "Rapide" : overallMttr > 0 ? "Moyen" : "N/A");
        kpis.put("mttrUp", overallMttr > 0 && overallMttr < 24);
        kpis.put("maintenanceCost", totalCost);
        kpis.put("maintenanceCostTrend", totalCost > 0 ? String.format("%.0f MAD", totalCost) : "Stable");
        kpis.put("maintenanceCostUp", false);
        kpis.put("availability", uptimePct2);
        kpis.put("availabilityTrend", uptimePct2 >= 99 ? "Optimal" : uptimePct2 >= 95 ? "Bon" : "Attention");
        kpis.put("availabilityUp", true);
        kpis.put("totalCost", totalCost);
        kpis.put("totalCostTrend", totalCost > 0 ? String.format("%.0f MAD", totalCost) : "Stable");
        kpis.put("activeWorkOrders", (int) activeCount);
        kpis.put("preventiveCount", (int) preventiveCount);
        kpis.put("correctiveCount", (int) correctiveCount);
        return kpis;
    }

    private double calculateOverallMtbf(List<WorkOrder> allWO, List<MotorEntity> allMotors) {
        Map<String, String> motorToSite = new HashMap<>();
        for (MotorEntity m : allMotors) {
            if (m.getId() == null) continue;
            motorToSite.put(m.getId(), resolveSite(m));
        }

        Map<String, List<WorkOrder>> correctiveBySite = new HashMap<>();
        for (WorkOrder wo : allWO) {
            if (wo.getType() == null || !wo.getType().equals("Correctif")) continue;
            if (wo.getAsset() == null) continue;
            String site = motorToSite.get(wo.getAsset());
            if (site != null) {
                correctiveBySite.computeIfAbsent(site, k -> new ArrayList<>()).add(wo);
            }
        }

        if (correctiveBySite.isEmpty()) return 0.0;

        double totalSiteMtbf = 0.0;
        int siteCount = 0;
        for (List<WorkOrder> wos : correctiveBySite.values()) {
            double siteMtbf = calculateSiteMtbf(wos);
            if (siteMtbf > 0) {
                totalSiteMtbf += siteMtbf;
                siteCount++;
            }
        }

        return siteCount > 0 ? Math.round((totalSiteMtbf / siteCount) * 10.0) / 10.0 : 0.0;
    }
}
