package com.vibraguard.gateway;

import com.vibraguard.gateway.entity.*;
import com.vibraguard.gateway.repository.*;
import com.vibraguard.gateway.auth.model.User;
import com.vibraguard.gateway.auth.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Schedulers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
public class MainController {

    @Autowired
    private MotorRepository motorRepository;
    @Autowired
    private AlertRepository alertRepository;
    @Autowired
    private WorkOrderRepository workOrderRepository;
    @Autowired
    private AuditRepository auditRepository;
    @Autowired
    private SiteMtbfRepository siteMtbfRepository;
    @Autowired
    private MaintenanceCostRepository maintenanceCostRepository;
    @Autowired
    private InterventionRepository interventionRepository;
    @Autowired
    private VibrationRepository vibrationRepository;
    @Autowired
    private TraceabilityRepository traceabilityRepository;
    @Autowired
    private KpiValueRepository kpiValueRepository;
    @Autowired
    private TechnicianRepository technicianRepository;
    @Autowired
    private InventoryPartRepository inventoryPartRepository;
    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    public void seedData() {
        if (kpiValueRepository.count() == 0) {
            // IoT KPIs
            kpiValueRepository.save(new KpiValue("totalMotorsTrend", null, "+12% ce mois", null, null));
            kpiValueRepository.save(new KpiValue("criticalMotorsTrend", null, "+2 aujourd'hui", null, null));
            kpiValueRepository.save(new KpiValue("alertsTrend", null, "+2 aujourd'hui", null, null));
            kpiValueRepository.save(new KpiValue("uptime", 98.5, null, "+0.4% ce mois", true));

            // BI KPIs
            kpiValueRepository.save(new KpiValue("mtbf", 1240.0, null, "+12.5% vs mois préc.", true));
            kpiValueRepository.save(new KpiValue("mttr", 3.2, null, "-5.4% vs mois préc.", false));
            kpiValueRepository.save(new KpiValue("availability", 98.4, null, "+0.2% vs mois préc.", true));
            kpiValueRepository.save(new KpiValue("maintenanceCostTrend", null, "-15.0% vs budget", null, false));

            // Blockchain KPIs
            kpiValueRepository.save(new KpiValue("secureBlocks", 104829.0, null, "+14 aujourd'hui", true));
            kpiValueRepository.save(new KpiValue("smartContracts", 42.0, null, null, null));
            kpiValueRepository.save(new KpiValue("integrityRate", 100.0, null, null, null));
            kpiValueRepository.save(new KpiValue("validationTime", 2.4, null, null, null));
        }

    }

    // IoT Endpoints
    @PostMapping("/iot/motors")
    public Mono<Motor> createMotor(@RequestBody Motor motor) {
        return Mono.fromCallable(() -> {
            if (motor.getId() == null) {
                motor.setId("MTR-" + (motorRepository.count() + 10));
            }
            return motorRepository.save(motor);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @PutMapping("/iot/motors/{id}")
    public Mono<Motor> updateMotor(@PathVariable("id") String id, @RequestBody Motor motor) {
        return Mono.fromCallable(() -> {
            return motorRepository.findById(id).map(existing -> {
                if (motor.getType() != null) existing.setType(motor.getType());
                if (motor.getEtatLabel() != null) existing.setEtatLabel(motor.getEtatLabel());
                if (motor.getEtatColor() != null) existing.setEtatColor(motor.getEtatColor());
                if (motor.getEtatPct() != 0) existing.setEtatPct(motor.getEtatPct());
                if (motor.getVibration() != null) existing.setVibration(motor.getVibration());
                if (motor.getVibrationColor() != null) existing.setVibrationColor(motor.getVibrationColor());
                if (motor.getTrendIcon() != null) existing.setTrendIcon(motor.getTrendIcon());
                if (motor.getRul() != 0) existing.setRul(motor.getRul());
                if (motor.getRulTrend() != null) existing.setRulTrend(motor.getRulTrend());
                if (motor.getPower() != null) existing.setPower(motor.getPower());
                if (motor.getSpeed() != null) existing.setSpeed(motor.getSpeed());
                return motorRepository.save(existing);
            }).orElseGet(() -> {
                motor.setId(id);
                return motorRepository.save(motor);
            });
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @DeleteMapping("/iot/motors/{id}")
    public Mono<Void> deleteMotor(@PathVariable("id") String id) {
        return Mono.fromRunnable(() -> motorRepository.deleteById(id))
                .subscribeOn(Schedulers.boundedElastic())
                .then();
    }

    @GetMapping("/iot/motors")
    public Flux<Motor> getMotors() {
        return Flux.defer(() -> Flux.fromIterable(motorRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/iot/motors/{id}")
    public Mono<ResponseEntity<Motor>> getMotorById(@PathVariable("id") String id) {
        return Mono.fromCallable(() -> motorRepository.findById(id))
                .subscribeOn(Schedulers.boundedElastic())
                .map(opt -> opt.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build()));
    }

    @GetMapping("/iot/motors/{id}/vibration")
    public Mono<List<VibrationData>> getMotorVibration(@PathVariable("id") String id) {
        return Mono.fromCallable(() -> vibrationRepository.findByMotorId(id))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/iot/kpis")
    public Mono<Map<String, Object>> getKPIs() {
        return Mono.fromCallable(() -> {
            Map<String, Object> kpis = new HashMap<>();
            long totalMotors = motorRepository.count();
            List<Motor> allMotors = motorRepository.findAll();
            long criticalMotors = allMotors.stream().filter(m -> m.getEtatLabel().contains("Critique") || m.getEtatLabel().contains("Alerte")).count();
            
            String today = new java.text.SimpleDateFormat("yyyy-MM-dd").format(new Date());
            long totalAlerts = alertRepository.count();
            long alertsToday = alertRepository.findAll().stream().filter(a -> a.getTime() != null && a.getTime().startsWith(today)).count();
            
            double uptime = 100.0 - (criticalMotors * 2.0);
            if (uptime < 0) uptime = 0;

            kpis.put("totalMotors", totalMotors);
            kpis.put("totalMotorsTrend", "Actualisé");
            
            kpis.put("criticalMotors", criticalMotors);
            kpis.put("criticalMotorsTrend", "+" + alertsToday + " alertes");
            
            kpis.put("alerts", totalAlerts);
            kpis.put("alertsTrend", "+" + alertsToday + " aujourd'hui");
            
            kpis.put("uptime", Math.round(uptime * 10.0) / 10.0 + "%");
            kpis.put("uptimeTrend", "Stable");
            kpis.put("uptimeTrendUp", true);
            return kpis;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/search")
    public Mono<Map<String, Object>> search(@RequestParam("q") String query) {
        return Mono.fromCallable(() -> {
            String q = query.toLowerCase();
            Map<String, Object> results = new HashMap<>();
            
            List<Motor> foundMotors = motorRepository.findAll().stream()
                .filter(m -> m.getId().toLowerCase().contains(q) || 
                            (m.getType() != null && m.getType().toLowerCase().contains(q)))
                .limit(5)
                .toList();
                
            List<Alert> foundAlerts = alertRepository.findAll().stream()
                .filter(a -> a.getMessage().toLowerCase().contains(q) || 
                            a.getId().toLowerCase().contains(q))
                .limit(5)
                .toList();

            results.put("motors", foundMotors);
            results.put("alerts", foundAlerts);
            results.put("query", query);
            return results;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/iot/vibrations")
    public Flux<VibrationData> getVibrations() {
        return Flux.defer(() -> Flux.fromIterable(vibrationRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping("/iot/vibrations")
    public Mono<VibrationData> saveVibration(@RequestBody VibrationData data) {
        return Mono.fromCallable(() -> {
            if (data.getTime() == null) {
                data.setTime(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
            }
            return vibrationRepository.save(data);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    // ML Endpoints
    @GetMapping("/ml/alerts")
    public Flux<Alert> getAlerts() {
        return Flux.defer(() -> Flux.fromIterable(alertRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/ml/alerts/{id}")
    public Mono<ResponseEntity<Alert>> getAlertById(@PathVariable("id") String id) {
        return Mono.fromCallable(() -> alertRepository.findById(id))
                .subscribeOn(Schedulers.boundedElastic())
                .map(opt -> opt.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build()));
    }

    @PutMapping("/ml/alerts/{id}")
    public Mono<Alert> updateAlert(@PathVariable("id") String id, @RequestBody Alert alert) {
        return Mono.fromCallable(() -> {
            return alertRepository.findById(id).map(existing -> {
                existing.setStatus(alert.getStatus());
                existing.setMessage(alert.getMessage());
                existing.setLevel(alert.getLevel());
                existing.setPriority(alert.getPriority());
                if(alert.getVelociteRms() != null) existing.setVelociteRms(alert.getVelociteRms());
                if(alert.getAccelerationPeak() != null) existing.setAccelerationPeak(alert.getAccelerationPeak());
                if(alert.getTemperature() != null) existing.setTemperature(alert.getTemperature());
                if(alert.getScoreConfianceIA() != null) existing.setScoreConfianceIA(alert.getScoreConfianceIA());
                if(alert.getDepassementSeuil() != null) existing.setDepassementSeuil(alert.getDepassementSeuil());
                return alertRepository.save(existing);
            }).orElseGet(() -> {
                alert.setId(id);
                return alertRepository.save(alert);
            });
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping("/ml/alerts")
    public Mono<Alert> createAlert(@RequestBody Alert alert) {
        return Mono.fromCallable(() -> {
            if (alert.getId() == null) {
                alert.setId("ALR-" + UUID.randomUUID().toString().substring(0, 8));
            }
            if (alert.getTime() == null) {
                alert.setTime(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
            }
            return alertRepository.save(alert);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    // Work Order Endpoints
    @GetMapping("/iot/work-orders")
    public Flux<WorkOrder> getWorkOrders() {
        return Flux.defer(() -> Flux.fromIterable(workOrderRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/iot/work-orders/{id}")
    public Mono<ResponseEntity<WorkOrder>> getWorkOrderById(@PathVariable("id") String id) {
        return Mono.fromCallable(() -> workOrderRepository.findById(id))
                .subscribeOn(Schedulers.boundedElastic())
                .map(opt -> opt.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build()));
    }

    @PostMapping("/iot/work-orders")
    public Mono<WorkOrder> createWorkOrder(@RequestBody WorkOrder workOrder) {
        return Mono.fromCallable(() -> {
            if (workOrder.getId() == null) {
                workOrder.setId("W-" + (workOrderRepository.count() + 458));
            }
            return workOrderRepository.save(workOrder);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @PutMapping("/iot/work-orders/{id}")
    public Mono<WorkOrder> updateWorkOrder(@PathVariable("id") String id, @RequestBody WorkOrder workOrder) {
        return Mono.fromCallable(() -> {
            return workOrderRepository.findById(id).map(existing -> {
                existing.setTitle(workOrder.getTitle());
                existing.setAsset(workOrder.getAsset());
                existing.setStatus(workOrder.getStatus());
                existing.setPriority(workOrder.getPriority());
                existing.setAssignedTo(workOrder.getAssignedTo());
                existing.setDueDate(workOrder.getDueDate());
                return workOrderRepository.save(existing);
            }).orElseGet(() -> {
                workOrder.setId(id);
                return workOrderRepository.save(workOrder);
            });
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/iot/technicians")
    public Flux<Object> getTechnicians() {
        return Flux.defer(() -> Flux.fromIterable(userRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic())
                .map(u -> {
                    Map<String, Object> t = new HashMap<>();
                    t.put("id", u.getId().toString());
                    t.put("name", u.getFullName());
                    t.put("specialization", u.getRole() != null ? u.getRole() : "Technicien");
                    return t;
                });
    }

    @DeleteMapping("/iot/work-orders/{id}")
    public Mono<Void> deleteWorkOrder(@PathVariable("id") String id) {
        return Mono.fromRunnable(() -> workOrderRepository.deleteById(id))
                .subscribeOn(Schedulers.boundedElastic())
                .then();
    }

    @GetMapping("/iot/inventory-parts")
    public Flux<InventoryPart> getInventoryParts() {
        return Flux.defer(() -> Flux.fromIterable(inventoryPartRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping("/iot/inventory/decrement/{id}")
    public Mono<InventoryPart> decrementInventory(@PathVariable("id") String id) {
        return Mono.fromCallable(() -> {
            return inventoryPartRepository.findById(id).map(part -> {
                if (part.getStock() > 0) {
                    part.setStock(part.getStock() - 1);
                    if (part.getStock() == 0) {
                        part.setStockColor("red");
                    } else if (part.getStock() < 3) {
                        part.setStockColor("amber");
                    }
                    return inventoryPartRepository.save(part);
                }
                return part;
            }).orElse(null);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    // Rapports BI Endpoints
    @GetMapping("/bi/kpis")
    public Mono<Map<String, Object>> getBIKPIs() {
        return Mono.fromCallable(() -> {
            Map<String, Object> kpis = new HashMap<>();
            
            long totalAlerts = alertRepository.count();
            long totalWorkOrders = workOrderRepository.count();
            double totalCost = maintenanceCostRepository.findAll().stream().mapToDouble(MaintenanceCost::getReel).sum();
            
            // Strictly data-driven calculations (0 if no data)
            double mtbf = totalAlerts > 0 ? 1000.0 / totalAlerts : 0.0;
            double mttr = totalWorkOrders > 0 ? 40.0 / totalWorkOrders : 0.0; // Assume 40h total repair time / count
            double availability = totalAlerts > 0 ? Math.max(0, 100.0 - (totalAlerts * 1.5)) : 100.0;

            kpis.put("mtbf", Math.round(mtbf));
            kpis.put("mtbfTrend", totalAlerts > 0 ? "Actualisé" : "Attente de données");
            kpis.put("mtbfUp", true);
            
            kpis.put("mttr", Math.round(mttr * 10.0) / 10.0);
            kpis.put("mttrTrend", totalWorkOrders > 0 ? "Actualisé" : "Attente de données");
            kpis.put("mttrUp", false);
            
            kpis.put("availability", Math.round(availability * 10.0) / 10.0);
            kpis.put("availabilityTrend", totalAlerts > 0 ? "Analyse en cours" : "Optimal");
            kpis.put("availabilityUp", true);
            
            kpis.put("maintenanceCost", totalCost);
            kpis.put("maintenanceCostTrend", "Réel");
            kpis.put("maintenanceCostUp", false);
            
            kpis.put("sitesConnected", siteMtbfRepository.count());
            kpis.put("activeAlerts", totalAlerts);
            return kpis;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/bi/mtbf-by-site")
    public Flux<SiteMtbf> getMtbfBySite() {
        return Flux.defer(() -> Flux.fromIterable(siteMtbfRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/bi/maintenance-costs")
    public Flux<MaintenanceCost> getMaintenanceCosts() {
        return Flux.defer(() -> Flux.fromIterable(maintenanceCostRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/bi/interventions")
    public Flux<Intervention> getInterventions() {
        return Flux.defer(() -> Flux.fromIterable(interventionRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping("/bi/kpis/upsert")
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

    @GetMapping("/bi/reports")
    public Mono<List<Map<String, Object>>> getBIReports() {
        return Mono.just(new ArrayList<>()); // Stub
    }

    // Blockchain Endpoints
    @GetMapping("/blockchain/kpis")
    public Mono<Map<String, Object>> getBlockchainKPIs() {
        return Mono.fromCallable(() -> {
            Map<String, Object> kpis = new HashMap<>();
            kpis.put("secureBlocks", kpiValueRepository.findById("secureBlocks").map(KpiValue::getNumericValue).orElse(104829.0));
            kpis.put("secureBlocksTrend", kpiValueRepository.findById("secureBlocks").map(KpiValue::getTrend).orElse("+14 aujourd'hui"));
            kpis.put("secureBlocksUp", kpiValueRepository.findById("secureBlocks").map(KpiValue::getTrendUp).orElse(true));
            kpis.put("smartContracts", kpiValueRepository.findById("smartContracts").map(KpiValue::getNumericValue).orElse(42.0));
            kpis.put("integrityRate", kpiValueRepository.findById("integrityRate").map(KpiValue::getNumericValue).orElse(100.0));
            kpis.put("validationTime", kpiValueRepository.findById("validationTime").map(KpiValue::getNumericValue).orElse(2.4));
            return kpis;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/blockchain/audit")
    public Flux<AuditEntry> getAuditHistory() {
        return Flux.defer(() -> Flux.fromIterable(auditRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/blockchain/traceability")
    public Flux<TraceabilityStep> getTraceability() {
        return Flux.defer(() -> Flux.fromIterable(traceabilityRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

}
