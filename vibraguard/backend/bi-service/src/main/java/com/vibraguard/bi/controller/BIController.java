package com.vibraguard.bi.controller;

import com.vibraguard.bi.entity.*;
import com.vibraguard.bi.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/bi")
public class BIController {

    @Autowired
    private MaintenanceCostRepository maintenanceCostRepository;
    @Autowired
    private KpiValueRepository kpiValueRepository;

    @GetMapping("/kpis")
    public Map<String, Object> getBIKPIs() {
        Map<String, Object> kpis = new HashMap<>();
        kpis.put("totalMotors", 0);
        kpis.put("totalMotorsTrend", "+0%");
        kpis.put("criticalMotors", 0);
        kpis.put("criticalMotorsTrend", "Stable");
        kpis.put("uptime", "100.0%");
        kpis.put("uptimeTrend", "Optimal");
        kpis.put("uptimeTrendUp", true);
        kpis.put("alerts", 0);
        kpis.put("alertsTrend", "Aucune");
        kpis.put("sitesConnected", 0);
        kpis.put("activeAlerts", 0);
        kpis.put("mtbf", 0.0);
        kpis.put("mttr", 0.0);
        kpis.put("totalCost", 0.0);
        kpis.put("activeWorkOrders", 0);
        return kpis;
    }

    @PostMapping("/kpis/upsert")
    public KpiValue upsertKPI(@RequestBody KpiValue kpi) {
        return kpiValueRepository.findById(kpi.getId()).map(existing -> {
            if (kpi.getNumericValue() != null) existing.setNumericValue(kpi.getNumericValue());
            if (kpi.getStringValue() != null) existing.setStringValue(kpi.getStringValue());
            if (kpi.getTrend() != null) existing.setTrend(kpi.getTrend());
            if (kpi.getTrendUp() != null) existing.setTrendUp(kpi.getTrendUp());
            return kpiValueRepository.save(existing);
        }).orElseGet(() -> kpiValueRepository.save(kpi));
    }

    @GetMapping("/maintenance-costs")
    public List<MaintenanceCost> getMaintenanceCosts() {
        return maintenanceCostRepository.findAll();
    }

    @GetMapping("/interventions")
    public List<Map<String, Object>> getInterventions() {
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, Object> preventif = new HashMap<>();
        preventif.put("type", "Pr\u00e9ventif");
        preventif.put("value", 65);
        preventif.put("color", "#10B981");
        list.add(preventif);
        Map<String, Object> correctif = new HashMap<>();
        correctif.put("type", "Correctif");
        correctif.put("value", 35);
        correctif.put("color", "#EF4444");
        list.add(correctif);
        return list;
    }

    @GetMapping("/mtbf-by-site")
    public List<Map<String, Object>> getMtbfBySite() {
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, Object> site1 = new HashMap<>();
        site1.put("name", "Site A");
        site1.put("value", 720);
        site1.put("color", "#3B82F6");
        list.add(site1);
        Map<String, Object> site2 = new HashMap<>();
        site2.put("name", "Site B");
        site2.put("value", 540);
        site2.put("color", "#F59E0B");
        list.add(site2);
        Map<String, Object> site3 = new HashMap<>();
        site3.put("name", "Site C");
        site3.put("value", 890);
        site3.put("color", "#10B981");
        list.add(site3);
        return list;
    }

    @GetMapping("/reports")
    public List<Map<String, Object>> getBIReports() {
        return new ArrayList<>();
    }
}
