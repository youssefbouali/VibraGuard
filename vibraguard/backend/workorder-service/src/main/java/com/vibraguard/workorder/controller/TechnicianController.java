package com.vibraguard.workorder.controller;

import com.vibraguard.workorder.entity.Technician;
import com.vibraguard.workorder.repository.TechnicianRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.*;

@RestController
@RequestMapping("/api/v1/iot/technicians")
public class TechnicianController {

    @Autowired
    private TechnicianRepository technicianRepository;

    @PostMapping
    public Mono<ResponseEntity<Technician>> createTechnician(@RequestBody Technician technician) {
        return Mono.fromCallable(() -> ResponseEntity.ok(technicianRepository.save(technician)))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping
    public Flux<Technician> getTechnicians() {
        return Flux.defer(() -> Flux.fromIterable(technicianRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<Technician>> getTechnicianById(@PathVariable("id") String id) {
        return Mono.fromCallable(() -> technicianRepository.findById(id))
                .subscribeOn(Schedulers.boundedElastic())
                .map(opt -> opt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()));
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<Technician>> updateTechnician(@PathVariable("id") String id, @RequestBody Technician technician) {
        return Mono.fromCallable(() -> {
            Optional<Technician> existing = technicianRepository.findById(id);
            if (existing.isPresent()) {
                Technician t = existing.get();
                if (technician.getName() != null) t.setName(technician.getName());
                if (technician.getEmail() != null) t.setEmail(technician.getEmail());
                if (technician.getDepartment() != null) t.setDepartment(technician.getDepartment());
                if (technician.getRole() != null) t.setRole(technician.getRole());
                if (technician.getStatus() != null) t.setStatus(technician.getStatus());
                if (technician.getPhoneNumber() != null) t.setPhoneNumber(technician.getPhoneNumber());
                if (technician.getLastConnection() != null) t.setLastConnection(technician.getLastConnection());
                return ResponseEntity.ok(technicianRepository.save(t));
            }
            return ResponseEntity.notFound().<Technician>build();
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteTechnician(@PathVariable("id") String id) {
        return Mono.fromCallable(() -> {
            technicianRepository.deleteById(id);
            return ResponseEntity.noContent().<Void>build();
        }).subscribeOn(Schedulers.boundedElastic());
    }
}
