package com.vibraguard.iot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@SpringBootApplication
@RestController
@RequestMapping("/api/v1/iot")
public class IotApplication {

    public static void main(String[] args) {
        SpringApplication.run(IotApplication.class, args);
    }

    @GetMapping("/motors")
    public List<Map<String, Object>> getMotors() {
        List<Map<String, Object>> motors = new ArrayList<>();
        
        motors.add(createMotor("MTR-Broyeur-04", "Broyeur Phosphate", "22% Critique", "#EF4444", 22, "14.2 mm/s", "#EF4444", "up"));
        motors.add(createMotor("MTR-Ventil-12", "Convoyeur L-2", "45% Alerte", "#F59E0B", 45, "8.4 mm/s", "#F59E0B", "up"));
        motors.add(createMotor("MTR-Pompe-08", "Pompe Principale", "58% Attention", "#F59E0B", 58, "6.1 mm/s", "#E2E8F0", "flat"));
        motors.add(createMotor("MTR-Compresseur-01", "Compresseur HP", "85% Optimal", "#10B981", 85, "2.4 mm/s", "#10B981", "down"));
        
        return motors;
    }

    @GetMapping("/kpis")
    public Map<String, Object> getKPIs() {
        Map<String, Object> kpis = new HashMap<>();
        kpis.put("totalMotors", 124);
        kpis.put("criticalMotors", 4);
        kpis.put("alerts", 12);
        kpis.put("uptime", "98.5%");
        return kpis;
    }

    private Map<String, Object> createMotor(String id, String type, String etatLabel, String etatColor, int etatPct, String vibration, String vibrationColor, String trendIcon) {
        Map<String, Object> motor = new HashMap<>();
        motor.put("id", id);
        motor.put("type", type);
        motor.put("etatLabel", etatLabel);
        motor.put("etatColor", etatColor);
        motor.put("etatPct", etatPct);
        motor.put("vibration", vibration);
        motor.put("vibrationColor", vibrationColor);
        motor.put("trendIcon", trendIcon);
        return motor;
    }
}
