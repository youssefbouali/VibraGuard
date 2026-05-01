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
        return Mono.fromRunnable(() -> motorRepository.deleteById(id))
                .subscribeOn(Schedulers.boundedElastic())
                .then();
    }

    @GetMapping
    public Flux<Map<String, Object>> getMotors() {
        return Flux.defer(() -> {
            List<Motor> motors = motorRepository.findAll();
            List<Alert> allAlerts = alertRepository.findAll();

            return Flux.fromIterable(motors.stream().map(m -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", m.getId());
                map.put("type", m.getType() != null ? m.getType() : "Asynchrone");
                map.put("etatLabel", m.getEtatLabel() != null ? m.getEtatLabel() : (m.getEtatPct() > 80 ? "Normal" : m.getEtatPct() > 50 ? "Attention" : "Critique"));
                map.put("etatColor", m.getEtatColor() != null ? m.getEtatColor() : (m.getEtatPct() > 80 ? "#007A3D" : m.getEtatPct() > 50 ? "#F2A900" : "#D93F3F"));
                map.put("etatPct", m.getEtatPct());
                map.put("vibration", m.getVibration() != null ? m.getVibration() : "2.4 mm/s");
                map.put("vibrationColor", m.getVibrationColor() != null ? m.getVibrationColor() : "#6EE7B7");
                map.put("trendIcon", m.getTrendIcon() != null ? m.getTrendIcon().toLowerCase() : "flat");
                
                // Add extra fields for other components if needed
                map.put("zone", m.getSite() != null ? m.getSite() : "Secteur A");
                map.put("localisation", m.getLocalisation() != null ? m.getLocalisation() : "Niveau 1");
                map.put("puissance", m.getPower() != null ? m.getPower() : "45 kW");
                
                return map;
            }).collect(Collectors.toList()));
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/{id}")
    public Mono<Motor> getMotorById(@PathVariable("id") String id) {
        return Mono.fromCallable(() -> motorRepository.findById(id).orElseThrow())
                .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/{id}/vibration")
    public Flux<String> getVibration(@PathVariable("id") String id) {
        return vibrationStreamService.getVibrationStream()
                .filter(json -> json.contains("\"motorId\":\"" + id + "\""));
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
            return vibrationRepository.save(vib);
        }).subscribeOn(Schedulers.boundedElastic());
    }
}
