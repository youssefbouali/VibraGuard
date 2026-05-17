package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.auth.model.User;
import com.vibraguard.gateway.auth.repository.UserRepository;
import com.vibraguard.gateway.util.ControllerUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.security.Principal;

import java.util.*;

@RestController
@RequestMapping("/api/v1/iot/technicians")
public class TechnicianController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ControllerUtils utils;

    @GetMapping
    public Flux<Map<String, Object>> getTechnicians() {
        return Flux.defer(() -> Flux.fromIterable(userRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic())
                .map(u -> {
                    Map<String, Object> t = new HashMap<>();
                    t.put("id", u.getId().toString());
                    t.put("name", u.getFullName());
                    t.put("email", u.getEmail());
                    t.put("role", u.getRole() != null ? u.getRole() : "Technicien");
                    t.put("department", u.getDepartment() != null ? u.getDepartment() : "Maintenance");
                    t.put("status", u.getStatus() != null ? u.getStatus() : "Actif");
                    t.put("lastConnection", "En ligne");
                    return t;
                });
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<User>> getTechnicianById(@PathVariable("id") String id) {
        return Mono.fromCallable(() -> userRepository.findById(Long.parseLong(id)))
                .subscribeOn(Schedulers.boundedElastic())
                .map(opt -> opt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()));
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<User>> updateTechnician(@PathVariable("id") String id, @RequestBody User technician) {
        return Mono.fromCallable(() -> {
            Optional<User> existing = userRepository.findById(Long.parseLong(id));
            if (existing.isPresent()) {
                User u = existing.get();
                if (technician.getFullName() != null) u.setFullName(technician.getFullName());
                if (technician.getEmail() != null) u.setEmail(technician.getEmail());
                if (technician.getRole() != null) u.setRole(technician.getRole());
                if (technician.getDepartment() != null) u.setDepartment(technician.getDepartment());
                if (technician.getStatus() != null) u.setStatus(technician.getStatus());
                return ResponseEntity.ok(userRepository.save(u));
            }
            return ResponseEntity.notFound().<User>build();
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteTechnician(@PathVariable("id") String id, Principal principal) {
        return Mono.<ResponseEntity<Void>>fromCallable(() -> {
            Optional<User> current = utils.currentUser(principal);
            if (current.isPresent() && current.get().getId().toString().equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build();
            }
            userRepository.deleteById(Long.parseLong(id));
            return ResponseEntity.noContent().<Void>build();
        }).subscribeOn(Schedulers.boundedElastic());
    }
}
