package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.entity.*;
import com.vibraguard.gateway.repository.*;
import com.vibraguard.gateway.auth.model.User;
import com.vibraguard.gateway.util.ControllerUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/ml/alerts")
public class AlertController {

    @Autowired
    private AlertRepository alertRepository;
    @Autowired
    private ControllerUtils utils;

    @GetMapping
    public Flux<Alert> getAlerts(Principal principal) {
        return Flux.defer(() -> {
            List<Alert> all = alertRepository.findAll();
            List<Alert> filtered = all.stream()
                    .filter(a -> isAllowedAlert(principal, a))
                    .sorted((a, b) -> b.getTime().compareTo(a.getTime()))
                    .collect(Collectors.toList());
            return Flux.fromIterable(filtered);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping
    public Mono<Alert> createAlert(@RequestBody Alert alert) {
        return Mono.fromCallable(() -> {
            if (alert.getId() == null) {
                alert.setId("ALR-" + (alertRepository.count() + 8403));
            }
            if (alert.getTime() == null) {
                alert.setTime(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
            }
            if (alert.getType() == null) {
                alert.setType("ALERT");
            }
            return alertRepository.save(alert);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @PutMapping("/{id}")
    public Mono<Alert> updateAlert(@PathVariable("id") String id, @RequestBody Alert alert) {
        return Mono.fromCallable(() -> {
            return alertRepository.findById(id).map(existing -> {
                if (alert.getStatus() != null) existing.setStatus(alert.getStatus());
                if (alert.getPriority() != null) existing.setPriority(alert.getPriority());
                if (alert.getLevel() != null) existing.setLevel(alert.getLevel());
                return alertRepository.save(existing);
            }).orElseGet(() -> {
                alert.setId(id);
                return alertRepository.save(alert);
            });
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping("/mark-all-read")
    public Mono<Void> markAllRead(Principal principal) {
        return Mono.fromRunnable(() -> {
            Optional<User> current = utils.currentUser(principal);
            if (current.isPresent()) {
                List<Alert> unread = alertRepository.findAll().stream()
                        .filter(a -> "Nouveau".equalsIgnoreCase(a.getStatus()) && isAllowedAlert(principal, a))
                        .collect(Collectors.toList());
                unread.forEach(a -> a.setStatus("Read"));
                alertRepository.saveAll(unread);
            }
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

    @PostMapping("/{id}/read")
    public Mono<Void> markAsRead(@PathVariable("id") String id, Principal principal) {
        return Mono.fromRunnable(() -> {
            alertRepository.findById(id).ifPresent(a -> {
                if (isAllowedAlert(principal, a)) {
                    a.setStatus("Read");
                    alertRepository.save(a);
                }
            });
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

    private boolean isAllowedAlert(Principal principal, Alert alert) {
        Optional<User> current = utils.currentUser(principal);
        if (current.isEmpty()) return false;
        User u = current.get();

        String recipient = alert.getRecipientEmail();
        if (recipient != null && !recipient.trim().isEmpty()) {
            return u.getEmail().equalsIgnoreCase(recipient.trim());
        }
        return true; 
    }
}
