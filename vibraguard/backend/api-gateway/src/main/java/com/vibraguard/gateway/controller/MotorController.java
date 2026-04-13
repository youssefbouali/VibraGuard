package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.entity.*;
import com.vibraguard.gateway.repository.*;
import com.vibraguard.gateway.service.VibrationStreamService;
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
                if (motor.getRul() != 0) existing.setRul(motor.getRul());
                if (motor.getRulTrend() != null) existing.setRulTrend(motor.getRulTrend());
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
                map.put("zone", m.getSite() != null ? m.getSite() : "Zone Broyage");
                map.put("localisation", m.getLocalisation() != null ? m.getLocalisation() : "Niveau 1, Secteur B");
                map.put("type", m.getType() != null ? m.getType() : "Moteur Asynchrone");
                map.put("puissance", m.getPower() != null ? m.getPower() : "45 kW");
                map.put("etatSante", m.getEtatLabel() != null ? m.getEtatLabel() : (m.getEtatPct() > 80 ? "Normal" : m.getEtatPct() > 50 ? "Attention" : "Critique"));
                map.put("vibrationRMS", m.getVibration() != null ? m.getVibration() : 2.4);
                
                List<Alert> motorAlerts = allAlerts.stream()
                        .filter(a -> m.getId().equalsIgnoreCase(a.getMotorId()))
                        .sorted((a, b) -> b.getTime().compareTo(a.getTime()))
                        .collect(Collectors.toList());

                map.put("derniereAlerte", motorAlerts.isEmpty() ? "Aucune" : motorAlerts.get(0).getMessage());
                map.put("etatColor", m.getEtatColor() != null ? m.getEtatColor() : (m.getEtatPct() > 80 ? "bg-[#007A3D]" : m.getEtatPct() > 50 ? "bg-[#F2A900]" : "bg-[#D93F3F]"));
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
    public Flux<VibrationData> getVibration(@PathVariable("id") String id) {
        return vibrationStreamService.getVibrationData(id);
    }
}
