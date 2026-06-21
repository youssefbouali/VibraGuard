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
                if (technician.getSpecialization() != null) t.setSpecialization(technician.getSpecialization());
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
