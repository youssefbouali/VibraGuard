package com.vibraguard.gateway;

import com.vibraguard.gateway.entity.*;
import com.vibraguard.gateway.repository.*;
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

    @PostConstruct
    public void seedData() {
        seedMotor("MTR-Broyeur-04", "Broyeur Phosphate", "22% Critique", "#EF4444", 22, "14.2 mm/s", "#EF4444", "up");
        seedMotor("MTR-Ventil-12", "Convoyeur L-2", "45% Alerte", "#F59E0B", 45, "8.4 mm/s", "#F59E0B", "up");
        seedMotor("MTR-Pompe-08", "Pompe Principale", "58% Attention", "#F59E0B", 58, "6.1 mm/s", "#E2E8F0", "flat");
        seedMotor("MTR-Compresseur-01", "Compresseur HP", "85% Optimal", "#10B981", 85, "2.4 mm/s", "#10B981", "down");
        

        if (workOrderRepository.count() == 0) {
            workOrderRepository.save(new WorkOrder("W-455", "Remplacement Roulement P1", "Pompe Principale", "En cours",
                    "Expert Maintenance", "2026-06-20", "Haute"));
            workOrderRepository.save(new WorkOrder("W-456", "Inspection Broyeur 04", "Broyeur Phosphate", "Nouveau",
                    "Agent Maintenance", "2026-06-21", "Critique"));
            workOrderRepository.save(new WorkOrder("W-457", "Nettoyage Filtres Ventil-12", "Convoyeur L-2", "Terminé",
                    "Equipe B", "2026-06-18", "Basse"));
        }
        if (auditRepository.count() == 0) {
            auditRepository.save(new AuditEntry("0x7a8b...2c", "Ajout de capteur SN-203", "Expert Maintenance",
                    "20/05/2026 14:30", "Validé"));
            auditRepository.save(new AuditEntry("0x1d2e...4f", "Modification seuil alerte MTR-04", "Administrateur",
                    "19/05/2026 09:15", "Validé"));
            auditRepository.save(new AuditEntry("0x3f4g...1h", "Clôture ordre de travail W-455", "Agent Maintenance",
                    "18/05/2026 16:45", "Validé"));
        }
        if (siteMtbfRepository.count() == 0) {
            siteMtbfRepository.save(new SiteMtbf("Site Jorf Lasfar", 1450, "#007A3D"));
            siteMtbfRepository.save(new SiteMtbf("Site Safi", 1220, "#057485"));
            siteMtbfRepository.save(new SiteMtbf("Site Laâyoune", 1180, "#0C6CF2"));
            siteMtbfRepository.save(new SiteMtbf("Site Khouribga", 950, "#F2A900"));
            siteMtbfRepository.save(new SiteMtbf("Site Benguérir", 840, "#D93F3F"));
        }
        if (maintenanceCostRepository.count() == 0) {
            maintenanceCostRepository.save(new MaintenanceCost(null, "Jan", 26000, 40000));
            maintenanceCostRepository.save(new MaintenanceCost(null, "Fév", 30000, 40500));
            maintenanceCostRepository.save(new MaintenanceCost(null, "Mar", 21000, 40000));
            maintenanceCostRepository.save(new MaintenanceCost(null, "Avr", 35000, 41000));
            maintenanceCostRepository.save(new MaintenanceCost(null, "Mai", 47000, 40000));
        }
        if (interventionRepository.count() == 0) {
            interventionRepository.save(new Intervention("Correctif", 45, "#0EA5E9"));
            interventionRepository.save(new Intervention("Préventif", 30, "#10B981"));
            interventionRepository.save(new Intervention("Prédictif", 25, "#F59E0B"));
        }
        if (traceabilityRepository.count() == 0) {
            traceabilityRepository.save(new TraceabilityStep(null, "Alerte #8402", "24 Oct, 08:15", "done", "#007A3D",
                    "#061B1C", "#98A6A8", "alert"));
            traceabilityRepository.save(new TraceabilityStep(null, "OT #4092", "24 Oct, 08:30", "done", "#007A3D",
                    "#061B1C", "#98A6A8", "order"));
            traceabilityRepository.save(new TraceabilityStep(null, "Intervention", "24 Oct, 14:30", "done", "#007A3D",
                    "#061B1C", "#98A6A8", "intervention"));
            traceabilityRepository.save(new TraceabilityStep(null, "Smart Contract", "Validation en cours", "active",
                    "#0C6CF2", "#08192E", "#0C6CF2", "contract"));
            traceabilityRepository.save(new TraceabilityStep(null, "Bloc #104830", "Attente réseau", "pending",
                    "rgba(0,0,0,0.08)", "#071018", "#98A6A8", "block"));
        }
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

        if (technicianRepository.count() == 0) {
            technicianRepository.save(new Technician("TECH-01", "Karim B. (Spéc. Vibrations)", "Spécialiste Vibrations", "https://api.builder.io/api/v1/image/assets/TEMP/7b02cb388b87f56a63a235a8d02a1683e015ed41?width=56"));
            technicianRepository.save(new Technician("TECH-02", "Ahmed S. (Mécanicien Sr)", "Mécanicien Senior", null));
            technicianRepository.save(new Technician("TECH-03", "Youssef M. (Électricien)", "Électricien", null));
        }

        if (inventoryPartRepository.count() == 0) {
            inventoryPartRepository.save(new InventoryPart("PART-01", "Palier SKF-6205", 4, "green"));
            inventoryPartRepository.save(new InventoryPart("PART-02", "Capteur VibraSense", 1, "amber"));
            inventoryPartRepository.save(new InventoryPart("PART-03", "Courroie Trapézoïdale", 12, "green"));
            inventoryPartRepository.save(new InventoryPart("PART-04", "Joint à Lèvre", 0, "amber"));
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
                existing.setType(motor.getType());
                existing.setEtatLabel(motor.getEtatLabel());
                existing.setEtatColor(motor.getEtatColor());
                existing.setEtatPct(motor.getEtatPct());
                existing.setVibration(motor.getVibration());
                existing.setVibrationColor(motor.getVibrationColor());
                existing.setTrendIcon(motor.getTrendIcon());
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
            kpis.put("totalMotors", motorRepository.count());
            kpis.put("totalMotorsTrend", kpiValueRepository.findById("totalMotorsTrend").map(KpiValue::getTrend).orElse("+12% ce mois"));
            kpis.put("criticalMotors",
                    motorRepository.findAll().stream().filter(m -> m.getEtatLabel().contains("Critique")).count());
            kpis.put("criticalMotorsTrend", kpiValueRepository.findById("criticalMotorsTrend").map(KpiValue::getTrend).orElse("+2 aujourd'hui"));
            kpis.put("alerts", alertRepository.count());
            kpis.put("alertsTrend", kpiValueRepository.findById("alertsTrend").map(KpiValue::getTrend).orElse("+2 aujourd'hui"));
            kpis.put("uptime", kpiValueRepository.findById("uptime").map(kv -> kv.getNumericValue() + "%").orElse("98.5%"));
            kpis.put("uptimeTrend", kpiValueRepository.findById("uptime").map(KpiValue::getTrend).orElse("+0.4% ce mois"));
            kpis.put("uptimeTrendUp", kpiValueRepository.findById("uptime").map(KpiValue::getTrendUp).orElse(true));
            return kpis;
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

    @DeleteMapping("/iot/work-orders/{id}")
    public Mono<Void> deleteWorkOrder(@PathVariable("id") String id) {
        return Mono.fromRunnable(() -> workOrderRepository.deleteById(id))
                .subscribeOn(Schedulers.boundedElastic())
                .then();
    }

    @GetMapping("/iot/technicians")
    public Flux<Technician> getTechnicians() {
        return Flux.defer(() -> Flux.fromIterable(technicianRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
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
            kpis.put("mtbf", kpiValueRepository.findById("mtbf").map(KpiValue::getNumericValue).orElse(1240.0));
            kpis.put("mtbfTrend", kpiValueRepository.findById("mtbf").map(KpiValue::getTrend).orElse("+12.5% vs mois préc."));
            kpis.put("mtbfUp", kpiValueRepository.findById("mtbf").map(KpiValue::getTrendUp).orElse(true));
            
            kpis.put("mttr", kpiValueRepository.findById("mttr").map(KpiValue::getNumericValue).orElse(3.2));
            kpis.put("mttrTrend", kpiValueRepository.findById("mttr").map(KpiValue::getTrend).orElse("-5.4% vs mois préc."));
            kpis.put("mttrUp", kpiValueRepository.findById("mttr").map(KpiValue::getTrendUp).orElse(false));
            
            kpis.put("availability", kpiValueRepository.findById("availability").map(KpiValue::getNumericValue).orElse(98.4));
            kpis.put("availabilityTrend", kpiValueRepository.findById("availability").map(KpiValue::getTrend).orElse("+0.2% vs mois préc."));
            kpis.put("availabilityUp", kpiValueRepository.findById("availability").map(KpiValue::getTrendUp).orElse(true));
            
            kpis.put("maintenanceCost",
                    maintenanceCostRepository.findAll().stream().mapToDouble(MaintenanceCost::getReel).sum());
            kpis.put("maintenanceCostTrend", kpiValueRepository.findById("maintenanceCostTrend").map(KpiValue::getTrend).orElse("-15.0% vs budget"));
            kpis.put("maintenanceCostUp", kpiValueRepository.findById("maintenanceCostTrend").map(KpiValue::getTrendUp).orElse(false));
            
            kpis.put("sitesConnected", siteMtbfRepository.count());
            kpis.put("activeAlerts", alertRepository.count());
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

    private void seedMotor(String id, String type, String label, String color, int pct, String vib, String vibCol, String trend) {
        if (motorRepository.findById(id).isEmpty()) {
            motorRepository.save(new Motor(id, type, label, color, pct, vib, vibCol, trend));
        }
    }
}
