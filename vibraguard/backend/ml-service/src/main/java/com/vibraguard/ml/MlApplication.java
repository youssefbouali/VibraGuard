package com.vibraguard.ml;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@SpringBootApplication
@RestController
@RequestMapping("/api/v1/ml")
public class MlApplication {

    public static void main(String[] args) {
        SpringApplication.run(MlApplication.class, args);
    }

    @GetMapping("/alerts")
    public List<Map<String, Object>> getAlerts() {
        List<Map<String, Object>> alerts = new ArrayList<>();
        
        alerts.add(createAlert("ALR-098", "Vibration excessive détectée sur Broyeur L-2", "Critique", "Il y a 2 min", "#EF4444", "high"));
        alerts.add(createAlert("ALR-097", "Usure anormale des roulements Pompe P1", "Alerte", "Il y a 15 min", "#F59E0B", "medium"));
        alerts.add(createAlert("ALR-096", "Température moteur au-dessus du seuil", "Attention", "Il y a 1h", "#F59E0B", "low"));
        
        return alerts;
    }

    private Map<String, Object> createAlert(String id, String message, String level, String time, String color, String priority) {
        Map<String, Object> alert = new HashMap<>();
        alert.put("id", id);
        alert.put("message", message);
        alert.put("level", level);
        alert.put("time", time);
        alert.put("color", color);
        alert.put("priority", priority);
        return alert;
    }
}
