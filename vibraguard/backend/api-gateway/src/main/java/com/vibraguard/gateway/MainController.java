package com.vibraguard.gateway;

import com.vibraguard.gateway.entity.*;
import com.vibraguard.gateway.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
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

    @PostConstruct
    public void seedData() {
        if (motorRepository.count() == 0) {
            motorRepository.save(new Motor("MTR-Broyeur-04", "Broyeur Phosphate", "22% Critique", "#EF4444", 22,
                    "14.2 mm/s", "#EF4444", "up"));
            motorRepository.save(new Motor("MTR-Ventil-12", "Convoyeur L-2", "45% Alerte", "#F59E0B", 45, "8.4 mm/s",
                    "#F59E0B", "up"));
            motorRepository.save(new Motor("MTR-Pompe-08", "Pompe Principale", "58% Attention", "#F59E0B", 58,
                    "6.1 mm/s", "#E2E8F0", "flat"));
            motorRepository.save(new Motor("MTR-Compresseur-01", "Compresseur HP", "85% Optimal", "#10B981", 85,
                    "2.4 mm/s", "#10B981", "down"));
        }
        if (alertRepository.count() == 0) {
            alertRepository.save(new Alert("ALR-098", "Vibration excessive détectée sur Broyeur L-2", "Critique",
                    "Il y a 2 min", "#EF4444", "high"));
            alertRepository.save(new Alert("ALR-097", "Usure anormale des roulements Pompe P1", "Alerte",
                    "Il y a 15 min", "#F59E0B", "medium"));
            alertRepository.save(new Alert("ALR-096", "Température moteur au-dessus du seuil", "Attention", "Il y a 1h",
                    "#F59E0B", "low"));
        }
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
        if (vibrationRepository.count() == 0) {
            vibrationRepository.save(new VibrationData(null, "10:00", 2.4, 3.1, 1.2));
            vibrationRepository.save(new VibrationData(null, "10:30", 8.5, 4.2, 2.1));
            vibrationRepository.save(new VibrationData(null, "11:00", 14.2, 6.1, 2.4));
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
    }

    // IoT Endpoints
    @GetMapping("/iot/motors")
    public List<Motor> getMotors() {
        return motorRepository.findAll();
    }

    @GetMapping("/iot/kpis")
    public Map<String, Object> getKPIs() {
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
    }

    @GetMapping("/iot/vibrations")
    public List<VibrationData> getVibrations() {
        return vibrationRepository.findAll();
    }

    // ML Endpoints
    @GetMapping("/ml/alerts")
    public List<Alert> getAlerts() {
        return alertRepository.findAll();
    }

    // Work Order Endpoints
    @GetMapping("/iot/work-orders")
    public List<WorkOrder> getWorkOrders() {
        return workOrderRepository.findAll();
    }

    // Rapports BI Endpoints
    @GetMapping("/bi/kpis")
    public Map<String, Object> getBIKPIs() {
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
    }

    @GetMapping("/bi/mtbf-by-site")
    public List<SiteMtbf> getMtbfBySite() {
        return siteMtbfRepository.findAll();
    }

    @GetMapping("/bi/maintenance-costs")
    public List<MaintenanceCost> getMaintenanceCosts() {
        return maintenanceCostRepository.findAll();
    }

    @GetMapping("/bi/interventions")
    public List<Intervention> getInterventions() {
        return interventionRepository.findAll();
    }

    @GetMapping("/bi/reports")
    public List<Map<String, Object>> getBIReports() {
        return new ArrayList<>(); // Stub
    }

    // Blockchain Endpoints
    @GetMapping("/blockchain/kpis")
    public Map<String, Object> getBlockchainKPIs() {
        Map<String, Object> kpis = new HashMap<>();
        kpis.put("secureBlocks", kpiValueRepository.findById("secureBlocks").map(KpiValue::getNumericValue).orElse(104829.0));
        kpis.put("secureBlocksTrend", kpiValueRepository.findById("secureBlocks").map(KpiValue::getTrend).orElse("+14 aujourd'hui"));
        kpis.put("secureBlocksUp", kpiValueRepository.findById("secureBlocks").map(KpiValue::getTrendUp).orElse(true));
        kpis.put("smartContracts", kpiValueRepository.findById("smartContracts").map(KpiValue::getNumericValue).orElse(42.0));
        kpis.put("integrityRate", kpiValueRepository.findById("integrityRate").map(KpiValue::getNumericValue).orElse(100.0));
        kpis.put("validationTime", kpiValueRepository.findById("validationTime").map(KpiValue::getNumericValue).orElse(2.4));
        return kpis;
    }

    @GetMapping("/blockchain/audit")
    public List<AuditEntry> getAuditHistory() {
        return auditRepository.findAll();
    }

    @GetMapping("/blockchain/traceability")
    public List<TraceabilityStep> getTraceability() {
        return traceabilityRepository.findAll();
    }
}
