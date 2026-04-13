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
    private MotorRepository motorRepository;
    @Autowired
    private WorkOrderRepository workOrderRepository;
    @Autowired
    private SiteMtbfRepository siteMtbfRepository;
    @Autowired
    private MaintenanceCostRepository maintenanceCostRepository;
    @Autowired
    private InterventionRepository interventionRepository;
    @Autowired
    private KpiValueRepository kpiValueRepository;

    @GetMapping("/kpis")
    public Mono<Map<String, Object>> getBIKPIs() {
        return Mono.fromCallable(() -> {
            List<Motor> allMotors = motorRepository.findAll();
            List<WorkOrder> allOrders = workOrderRepository.findAll();

            long totalMotors = allMotors.size();
            long criticalMotors = allMotors.stream()
                    .filter(m -> m.getEtatLabel() != null && (m.getEtatLabel().contains("Critique") || m.getEtatLabel().contains("Alerte")))
                    .count();

            double availability = (totalMotors == 0) ? 100.0 : ((double) (totalMotors - criticalMotors) / totalMotors) * 100.0;
            if (availability < 100 && criticalMotors == 0) availability = 100.0;

            double totalCost = allOrders.stream().mapToDouble(WorkOrder::getCost).sum();

            Map<String, Object> kpis = new HashMap<>();
            kpis.put("availability", availability);
            kpis.put("mtbf", 720.0); 
            kpis.put("mttr", 4.5);
            kpis.put("totalCost", totalCost);
            kpis.put("activeWorkOrders", allOrders.stream().filter(o -> !"Terminé".equalsIgnoreCase(o.getStatus())).count());
            kpis.put("totalMotors", totalMotors);
            kpis.put("criticalMotors", criticalMotors);

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
