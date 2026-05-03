package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.entity.*;
import com.vibraguard.gateway.repository.*;
import com.vibraguard.gateway.VibrationStreamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/iot/motors")
public class MotorController {

    @Autowired
    private MotorRepository motorRepository;
    @Autowired
    private AlertRepository alertRepository;
    @Autowired
    private VibrationRepository vibrationRepository;
    @Autowired
    private VibrationStreamService vibrationStreamService;

    @PostMapping
    public Mono<Motor> createMotor(@RequestBody Motor motor) {
        return Mono.fromCallable(() -> {
            if (motor.getId() == null) {
                motor.setId("MTR-" + (motorRepository.count() + 10));
            }
            return motorRepository.save(motor);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @PutMapping("/{id}")
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
                if (motor.getPower() != null) existing.setPower(motor.getPower());
                if (motor.getSpeed() != null) existing.setSpeed(motor.getSpeed());
                if (motor.getLocalisation() != null) existing.setLocalisation(motor.getLocalisation());
                if (motor.getSite() != null) existing.setSite(motor.getSite());
                return motorRepository.save(existing);
            }).orElseGet(() -> {
                motor.setId(id);
                return motorRepository.save(motor);
            });
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @DeleteMapping("/{id}")
    public Mono<Void> deleteMotor(@PathVariable("id") String id) {
        return Mono.fromRunnable(() -> {
            vibrationRepository.deleteByMotorId(id);
            alertRepository.deleteByMotorId(id);
            motorRepository.deleteById(id);
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

    @GetMapping
    public Flux<Map<String, Object>> getMotors() {
        return Flux.defer(() -> {
            List<Motor> motors = motorRepository.findAll();
            List<Alert> allAlerts = alertRepository.findAll();

            return Flux.fromIterable(motors.stream().map(m -> {
                List<VibrationData> motorVibs = vibrationRepository.findByMotorId(m.getId());
                long totalVibs = motorVibs.size();
                long anomalousVibs = motorVibs.stream().filter(VibrationData::isAnomalous).count();
                
                int healthPct = (totalVibs == 0) ? 100 : (int) (((double) (totalVibs - anomalousVibs) / totalVibs) * 100);
                String label = healthPct > 80 ? "Normal" : healthPct > 50 ? "Attention" : "Critique";
                String color = healthPct > 80 ? "#10B981" : healthPct > 50 ? "#F59E0B" : "#EF4444";

                Map<String, Object> map = new HashMap<>();
                map.put("id", m.getId());
                map.put("type", m.getType() != null ? m.getType() : "Asynchrone");
                map.put("etatLabel", healthPct + "% " + label);
                map.put("etatColor", color);
                map.put("etatPct", healthPct);
                map.put("vibration", m.getVibration() != null ? m.getVibration() : "0.00");
                map.put("vibrationColor", color);
                map.put("trendIcon", m.getTrendIcon() != null ? m.getTrendIcon().toLowerCase() : "flat");
                
                map.put("zone", m.getSite() != null ? m.getSite() : "Secteur A");
                map.put("localisation", m.getLocalisation() != null ? m.getLocalisation() : "Niveau 1");
                map.put("puissance", m.getPower() != null ? m.getPower() : "45 kW");
                
                return map;
            }).collect(Collectors.toList()));
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/{id}")
    public Mono<Motor> getMotorById(@PathVariable("id") String id) {
        return Mono.fromCallable(() -> {
            Motor m = motorRepository.findById(id).orElseThrow();
            List<VibrationData> motorVibs = vibrationRepository.findByMotorId(id);
            long totalVibs = motorVibs.size();
            long anomalousVibs = motorVibs.stream().filter(VibrationData::isAnomalous).count();
            
            int healthPct = (totalVibs == 0) ? 100 : (int) (((double) (totalVibs - anomalousVibs) / totalVibs) * 100);
            String label = healthPct > 80 ? "Normal" : healthPct > 50 ? "Attention" : "Critique";
            String color = healthPct > 80 ? "#10B981" : healthPct > 50 ? "#F59E0B" : "#EF4444";
            
            m.setEtatPct(healthPct);
            m.setEtatLabel(healthPct + "% " + label);
            m.setEtatColor(color);
            if (m.getVibration() == null || m.getVibration().isEmpty() || m.getVibration().equals("0.00")) {
                m.setVibration(motorVibs.isEmpty() ? "0.00" : String.format("%.2f", motorVibs.get(motorVibs.size()-1).getVibRms()));
            }
            return m;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/{id}/vibration")
    public Mono<List<VibrationData>> getVibration(@PathVariable("id") String id) {
        return Mono.fromCallable(() -> vibrationRepository.findByMotorId(id))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/vibrations")
    public Mono<List<VibrationData>> getAllVibrations() {
        return Mono.fromCallable(() -> vibrationRepository.findAll())
                .subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping("/vibrations")
    public Mono<VibrationData> saveVibration(@RequestBody VibrationData vib) {
        return Mono.fromCallable(() -> {
            if (vib.getTime() == null) {
                vib.setTime(java.time.LocalDateTime.now().toString());
            }
            VibrationData saved = vibrationRepository.save(vib);
            vibrationStreamService.emit(saved);
            return saved;
        }).subscribeOn(Schedulers.boundedElastic());
    }
}
