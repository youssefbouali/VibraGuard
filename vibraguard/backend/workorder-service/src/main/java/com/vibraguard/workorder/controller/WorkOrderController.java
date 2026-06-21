package com.vibraguard.workorder.controller;

import com.vibraguard.workorder.entity.*;
import com.vibraguard.workorder.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.*;

@RestController
@RequestMapping("/api/v1/iot/work-orders")
public class WorkOrderController {

    @Autowired
    private WorkOrderRepository workOrderRepository;
    @Autowired
    private WebClient.Builder webClientBuilder;

    @GetMapping
    public Flux<WorkOrder> getWorkOrders() {
        return Flux.defer(() -> Flux.fromIterable(workOrderRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping
    public Mono<WorkOrder> createWorkOrder(@RequestBody WorkOrder workOrder) {
        return Mono.fromCallable(() -> {
            if (workOrder.getId() == null) {
                workOrder.setId("W-" + (workOrderRepository.count() + 458));
            }
            if (workOrder.getCreatedAt() == null) {
                workOrder.setCreatedAt(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
            }
            WorkOrder saved = workOrderRepository.save(workOrder);
            return saved;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @PutMapping("/{id}")
    public Mono<WorkOrder> updateWorkOrder(@PathVariable("id") String id, @RequestBody WorkOrder workOrder) {
        return Mono.fromCallable(() -> {
            return workOrderRepository.findById(id).map(existing -> {
                existing.setTitle(workOrder.getTitle());
                existing.setAsset(workOrder.getAsset());
                if ("Terminé".equalsIgnoreCase(workOrder.getStatus()) && !"Terminé".equalsIgnoreCase(existing.getStatus())) {
                    existing.setCompletedAt(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
                }
                if ("Annulé".equalsIgnoreCase(workOrder.getStatus()) && !"Annulé".equalsIgnoreCase(existing.getStatus())) {
                    existing.setCancelledAt(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
                }
                existing.setStatus(workOrder.getStatus());
                existing.setPriority(workOrder.getPriority());
                existing.setAssignedTo(workOrder.getAssignedTo());
                existing.setDueDate(workOrder.getDueDate());
                existing.setType(workOrder.getType());
                existing.setCost(workOrder.getCost());
                existing.setDuration(workOrder.getDuration());
                existing.setParts(workOrder.getParts());

                // Notify assigned technician via alert-service
                if (workOrder.getAssignedTo() != null && !workOrder.getAssignedTo().equals(existing.getAssignedTo())) {
                    notifyTechnician(workOrder);
                }

                return workOrderRepository.save(existing);
            }).orElseGet(() -> {
                workOrder.setId(id);
                return workOrderRepository.save(workOrder);
            });
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @DeleteMapping("/{id}")
    public Mono<Void> deleteWorkOrder(@PathVariable("id") String id) {
        return Mono.fromRunnable(() -> workOrderRepository.deleteById(id))
                .subscribeOn(Schedulers.boundedElastic())
                .then();
    }

    private void notifyTechnician(WorkOrder workOrder) {
        try {
            Map<String, Object> alert = new HashMap<>();
            alert.put("id", "ALR-" + UUID.randomUUID().toString().substring(0, 8));
            alert.put("title", "Nouvel ordre de travail");
            alert.put("message", "Un nouvel ordre a été assigné : " + workOrder.getTitle() + " sur " + workOrder.getAsset() + ".");
            alert.put("level", "Attention");
            alert.put("status", "Nouveau");
            alert.put("priority", "Important");
            alert.put("color", "#0EA5E9");
            alert.put("time", new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
            alert.put("motorId", workOrder.getAsset());
            alert.put("type", "NOTIFICATION");

            webClientBuilder.build()
                    .post()
                    .uri("http://alert-service:8083/api/v1/ml/alerts")
                    .bodyValue(alert)
                    .retrieve()
                    .toBodilessEntity()
                    .onErrorResume(e -> {
                        System.err.println("Failed to notify: " + e.getMessage());
                        return Mono.empty();
                    })
                    .subscribe();
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }
}
