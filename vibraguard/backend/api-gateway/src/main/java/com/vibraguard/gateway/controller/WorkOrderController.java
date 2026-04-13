package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.entity.*;
import com.vibraguard.gateway.repository.*;
import com.vibraguard.gateway.auth.model.User;
import com.vibraguard.gateway.auth.repository.UserRepository;
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
@RequestMapping("/api/v1/iot/work-orders")
public class WorkOrderController {

    @Autowired
    private WorkOrderRepository workOrderRepository;
    @Autowired
    private AlertRepository alertRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ControllerUtils utils;

    @GetMapping
    public Flux<WorkOrder> getWorkOrders(Principal principal) {
        return Flux.defer(() -> {
            List<WorkOrder> orders = workOrderRepository.findAll();
            if (utils.isTechnician(principal)) {
                User current = utils.currentUser(principal).orElse(null);
                if (current != null && current.getFullName() != null) {
                    orders = orders.stream()
                            .filter(o -> o.getAssignedTo() != null && o.getAssignedTo().equalsIgnoreCase(current.getFullName()))
                            .collect(Collectors.toList());
                }
            }
            return Flux.fromIterable(orders);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping
    public Mono<WorkOrder> createWorkOrder(@RequestBody WorkOrder workOrder, Principal principal) {
        return Mono.fromCallable(() -> {
            if (workOrder.getId() == null) {
                workOrder.setId("W-" + (workOrderRepository.count() + 458));
            }
            if (utils.isTechnician(principal)) {
                User current = utils.currentUser(principal).orElse(null);
                if (current != null && current.getFullName() != null) {
                    workOrder.setAssignedTo(current.getFullName());
                }
            }
            WorkOrder saved = workOrderRepository.save(workOrder);
            maybeCreateWorkOrderNotification(saved, principal);
            return saved;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @PutMapping("/{id}")
    public Mono<WorkOrder> updateWorkOrder(@PathVariable("id") String id, @RequestBody WorkOrder workOrder, Principal principal) {
        return Mono.fromCallable(() -> {
            return workOrderRepository.findById(id).map(existing -> {
                existing.setTitle(workOrder.getTitle());
                existing.setAsset(workOrder.getAsset());
                existing.setStatus(workOrder.getStatus());
                existing.setPriority(workOrder.getPriority());
                if (utils.isAdmin(principal)) {
                    existing.setAssignedTo(workOrder.getAssignedTo());
                } else if (utils.isTechnician(principal)) {
                    User current = utils.currentUser(principal).orElse(null);
                    if (current != null && current.getFullName() != null) {
                        existing.setAssignedTo(current.getFullName());
                    }
                }
                existing.setDueDate(workOrder.getDueDate());
                existing.setType(workOrder.getType());
                existing.setCost(workOrder.getCost());
                existing.setDuration(workOrder.getDuration());
                existing.setParts(workOrder.getParts());
                return workOrderRepository.save(existing);
            }).orElseGet(() -> {
                workOrder.setId(id);
                if (utils.isTechnician(principal)) {
                    User current = utils.currentUser(principal).orElse(null);
                    if (current != null && current.getFullName() != null) {
                        workOrder.setAssignedTo(current.getFullName());
                    }
                }
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

    private void maybeCreateWorkOrderNotification(WorkOrder workOrder, Principal principal) {
        if (!utils.isAdmin(principal) || workOrder.getAssignedTo() == null) {
            return;
        }

        Optional<User> currentUserOpt = utils.currentUser(principal);
        Optional<User> assignedUser = userRepository.findAll().stream()
                .filter(u -> u.getFullName() != null && u.getFullName().equalsIgnoreCase(workOrder.getAssignedTo()))
                .findFirst();

        if (assignedUser.isEmpty()) return;

        if (currentUserOpt.isPresent() && currentUserOpt.get().getFullName() != null &&
                currentUserOpt.get().getFullName().equalsIgnoreCase(assignedUser.get().getFullName())) {
            return;
        }

        User technician = assignedUser.get();
        Alert newAlert = new Alert();
        newAlert.setId("ALR-" + UUID.randomUUID().toString().substring(0, 8));
        newAlert.setTitle("Nouvel ordre de travail");
        newAlert.setMessage("Un nouvel ordre a été assigné à vous : " + workOrder.getTitle() + " sur " + workOrder.getAsset() + ".");
        newAlert.setLevel("Attention");
        newAlert.setStatus("Nouveau");
        newAlert.setPriority("Important");
        newAlert.setColor("#0EA5E9");
        newAlert.setTime(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
        newAlert.setMotorId(workOrder.getAsset());
        newAlert.setRecipientEmail(technician.getEmail());
        newAlert.setType("NOTIFICATION");
        alertRepository.save(newAlert);
    }
}
