package com.vibraguard.alert.controller;

import com.vibraguard.alert.entity.*;
import com.vibraguard.alert.repository.*;
import com.vibraguard.alert.service.AlertStreamService;
import com.vibraguard.common.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/ml/alerts")
public class AlertController {

    @Autowired
    private AlertRepository alertRepository;
    @Autowired
    private AlertStreamService alertStreamService;
    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public Flux<Alert> getAlerts(ServerWebExchange exchange) {
        return Flux.defer(() -> {
            String userEmail = extractEmailFromRequest(exchange);
            List<Alert> all = alertRepository.findAll();
            List<Alert> sorted = all.stream()
                    .filter(a -> a.getRecipientEmail() == null || a.getRecipientEmail().equals(userEmail))
                    .sorted((a, b) -> b.getTime().compareTo(a.getTime()))
                    .collect(Collectors.toList());
            return Flux.fromIterable(sorted);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    private String extractEmailFromRequest(ServerWebExchange exchange) {
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                return jwtUtil.extractEmail(authHeader.substring(7));
            } catch (Exception e) {
                System.err.println("Failed to extract email from JWT: " + e.getMessage());
            }
        }
        return null;
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
            Alert saved = alertRepository.save(alert);
            if (alert.getRecipientEmail() == null) {
                alertStreamService.emit(saved);
            }
            return saved;
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
    public Mono<Void> markAllRead() {
        return Mono.fromRunnable(() -> {
            List<Alert> unread = alertRepository.findAll().stream()
                    .filter(a -> "Nouveau".equalsIgnoreCase(a.getStatus()))
                    .collect(Collectors.toList());
            unread.forEach(a -> a.setStatus("Read"));
            alertRepository.saveAll(unread);
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

    @PostMapping("/{id}/read")
    public Mono<Void> markAsRead(@PathVariable("id") String id) {
        return Mono.fromRunnable(() -> {
            alertRepository.findById(id).ifPresent(a -> {
                a.setStatus("Read");
                alertRepository.save(a);
            });
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }
}
