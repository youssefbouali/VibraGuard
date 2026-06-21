package com.vibraguard.bi.controller;

import com.vibraguard.bi.entity.*;
import com.vibraguard.bi.repository.*;
import com.vibraguard.bi.service.BIService;
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
    @Autowired
    private BIService biService;

    @GetMapping("/kpis")
    public Map<String, Object> getBIKPIs() {
        return biService.getBIKPIs();
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
        return biService.getInterventions();
    }

    @GetMapping("/mtbf-by-site")
    public List<Map<String, Object>> getMtbfBySite() {
        return biService.getMtbfBySite();
    }

    @GetMapping("/reports")
    public List<Map<String, Object>> getBIReports() {
        return new ArrayList<>();
    }
}
