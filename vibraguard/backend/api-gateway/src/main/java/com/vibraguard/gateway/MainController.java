package com.vibraguard.gateway;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
public class MainController {

    // IoT Endpoints
    @GetMapping("/iot/motors")
    public List<Map<String, Object>> getMotors() {
        List<Map<String, Object>> motors = new ArrayList<>();
        motors.add(createMotor("MTR-Broyeur-04", "Broyeur Phosphate", "22% Critique", "#EF4444", 22, "14.2 mm/s", "#EF4444", "up"));
        motors.add(createMotor("MTR-Ventil-12", "Convoyeur L-2", "45% Alerte", "#F59E0B", 45, "8.4 mm/s", "#F59E0B", "up"));
        motors.add(createMotor("MTR-Pompe-08", "Pompe Principale", "58% Attention", "#F59E0B", 58, "6.1 mm/s", "#E2E8F0", "flat"));
        motors.add(createMotor("MTR-Compresseur-01", "Compresseur HP", "85% Optimal", "#10B981", 85, "2.4 mm/s", "#10B981", "down"));
        return motors;
    }

    @GetMapping("/iot/kpis")
    public Map<String, Object> getKPIs() {
        Map<String, Object> kpis = new HashMap<>();
        kpis.put("totalMotors", 124);
        kpis.put("criticalMotors", 4);
        kpis.put("alerts", 12);
        kpis.put("uptime", "98.5%");
        return kpis;
    }

    // ML Endpoints
    @GetMapping("/ml/alerts")
    public List<Map<String, Object>> getAlerts() {
        List<Map<String, Object>> alerts = new ArrayList<>();
        alerts.add(createAlert("ALR-098", "Vibration excessive détectée sur Broyeur L-2", "Critique", "Il y a 2 min", "#EF4444", "high"));
        alerts.add(createAlert("ALR-097", "Usure anormale des roulements Pompe P1", "Alerte", "Il y a 15 min", "#F59E0B", "medium"));
        alerts.add(createAlert("ALR-096", "Température moteur au-dessus du seuil", "Attention", "Il y a 1h", "#F59E0B", "low"));
        return alerts;
    }

    // Work Order Endpoints
    @GetMapping("/iot/work-orders")
    public List<Map<String, Object>> getWorkOrders() {
        List<Map<String, Object>> workOrders = new ArrayList<>();
        workOrders.add(createWorkOrder("W-455", "Remplacement Roulement P1", "Pompe Principale", "En cours", "Expert Maintenance", "2026-06-20", "Haute"));
        workOrders.add(createWorkOrder("W-456", "Inspection Broyeur 04", "Broyeur Phosphate", "Nouveau", "Agent Maintenance", "2026-06-21", "Critique"));
        workOrders.add(createWorkOrder("W-457", "Nettoyage Filtres Ventil-12", "Convoyeur L-2", "Terminé", "Equipe B", "2026-06-18", "Basse"));
        return workOrders;
    }

    // Blockchain Endpoints
    @GetMapping("/blockchain/audit")
    public List<Map<String, Object>> getAuditHistory() {
        List<Map<String, Object>> audit = new ArrayList<>();
        audit.add(createAuditEntry("0x7a8b...2c", "Ajout de capteur SN-203", "Expert Maintenance", "20/05/2026 14:30", "Validé"));
        audit.add(createAuditEntry("0x1d2e...4f", "Modification seuil alerte MTR-04", "Administrateur", "19/05/2026 09:15", "Validé"));
        audit.add(createAuditEntry("0x3f4g...1h", "Clôture ordre de travail W-455", "Agent Maintenance", "18/05/2026 16:45", "Validé"));
        return audit;
    }

    private Map<String, Object> createMotor(String id, String type, String etatLabel, String etatColor, int etatPct, String vibration, String vibrationColor, String trendIcon) {
        Map<String, Object> motor = new HashMap<>();
        motor.put("id", id); motor.put("type", type); motor.put("etatLabel", etatLabel);
        motor.put("etatColor", etatColor); motor.put("etatPct", etatPct);
        motor.put("vibration", vibration); motor.put("vibrationColor", vibrationColor);
        motor.put("trendIcon", trendIcon);
        return motor;
    }

    private Map<String, Object> createAlert(String id, String message, String level, String time, String color, String priority) {
        Map<String, Object> alert = new HashMap<>();
        alert.put("id", id); alert.put("message", message); alert.put("level", level);
        alert.put("time", time); alert.put("color", color); alert.put("priority", priority);
        return alert;
    }

    private Map<String, Object> createAuditEntry(String hash, String action, String user, String date, String status) {
        Map<String, Object> entry = new HashMap<>();
        entry.put("hash", hash); entry.put("action", action); entry.put("user", user);
        entry.put("date", date); entry.put("status", status);
        return entry;
    }

    private Map<String, Object> createWorkOrder(String id, String title, String asset, String status, String assignedTo, String dueDate, String priority) {
        Map<String, Object> wo = new HashMap<>();
        wo.put("id", id);
        wo.put("title", title);
        wo.put("asset", asset);
        wo.put("status", status);
        wo.put("assignedTo", assignedTo);
        wo.put("dueDate", dueDate);
        wo.put("priority", priority);
        return wo;
    }
}
