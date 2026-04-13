package com.vibraguard.gateway;

import com.vibraguard.gateway.entity.*;
import com.vibraguard.gateway.repository.*;
import com.vibraguard.gateway.auth.model.User;
import com.vibraguard.gateway.auth.repository.UserRepository;
import com.vibraguard.gateway.service.IpfsService;
import jakarta.annotation.PostConstruct;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Schedulers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
public class MainController {

    @Autowired
    private MotorRepository motorRepository;
    @Autowired
    private AlertRepository alertRepository;
    @Autowired
    private WorkOrderRepository workOrderRepository;
    @Autowired
    private AuditRepository auditRepository;
    @Autowired
    private SiteMtbfRepository siteMtbfRepository;
    @Autowired
    private MaintenanceCostRepository maintenanceCostRepository;
    @Autowired
    private InterventionRepository interventionRepository;
    @Autowired
    private VibrationRepository vibrationRepository;
    @Autowired
    private TraceabilityRepository traceabilityRepository;
    @Autowired
    private KpiValueRepository kpiValueRepository;
    @Autowired
    private TechnicianRepository technicianRepository;
    @Autowired
    private InventoryPartRepository inventoryPartRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ReportRepository reportRepository;
    @Autowired
    private IpfsService ipfsService;

    @Autowired
    private VibrationStreamService vibrationStreamService;

    @PostConstruct
    public void seedData() {
        // Data is now primarily managed through the UI or ML services.
        // We avoid hardcoded default values as per request.
    }

    private Optional<User> currentUser(Principal principal) {
        if (principal == null) {
            return Optional.empty();
        }
        return userRepository.findByEmail(principal.getName());
    }

    private boolean isAdmin(Principal principal) {
        return currentUser(principal)
                .map(u -> u.getRole() != null && u.getRole().toLowerCase().contains("admin"))
                .orElse(false);
    }

    private boolean isTechnician(Principal principal) {
        return currentUser(principal)
                .map(u -> u.getRole() != null && (u.getRole().toLowerCase().contains("technicien")
                        || u.getRole().toLowerCase().contains("technician")))
                .orElse(false);
    }

    private boolean isAllowedAlert(Principal principal, Alert alert) {
        Optional<User> current = currentUser(principal);
        if (current.isEmpty()) {
            return false;
        }
        User u = current.get();

        String recipient = alert.getRecipientEmail();
        if (recipient != null && !recipient.trim().isEmpty()) {
            return u.getEmail().equalsIgnoreCase(recipient.trim());
        }

        if (isAdmin(principal)) {
            return true;
        }
        return true; // General alerts shown to everyone if no recipient
    }

    private void maybeCreateWorkOrderNotification(WorkOrder workOrder, Principal principal) {
        if (!isAdmin(principal) || workOrder.getAssignedTo() == null) {
            return;
        }

        Optional<User> currentUserOpt = currentUser(principal);
        Optional<User> assignedUser = userRepository.findAll().stream()
                .filter(u -> u.getFullName() != null && u.getFullName().equalsIgnoreCase(workOrder.getAssignedTo()))
                .findFirst();

        if (assignedUser.isEmpty()) {
            return;
        }

        // Skip notification if admin assigned to themselves
        if (currentUserOpt.isPresent() && currentUserOpt.get().getFullName() != null &&
                currentUserOpt.get().getFullName().equalsIgnoreCase(assignedUser.get().getFullName())) {
            return;
        }

        User technician = assignedUser.get();
        Alert newAlert = new Alert();
        newAlert.setId("ALR-" + UUID.randomUUID().toString().substring(0, 8));
        newAlert.setTitle("Nouvel ordre de travail");
        newAlert.setMessage("Un nouvel ordre a été assigné à vous : " + workOrder.getTitle() + " sur "
                + workOrder.getAsset() + ".");
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

    // IoT Endpoints
    @PostMapping("/iot/motors")
    public Mono<Motor> createMotor(@RequestBody Motor motor) {
        return Mono.fromCallable(() -> {
            if (motor.getId() == null) {
                motor.setId("MTR-" + (motorRepository.count() + 10));
            }
            return motorRepository.save(motor);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @PutMapping("/iot/motors/{id}")
    public Mono<Motor> updateMotor(@PathVariable("id") String id, @RequestBody Motor motor) {
        return Mono.fromCallable(() -> {
            return motorRepository.findById(id).map(existing -> {
                if (motor.getType() != null)
                    existing.setType(motor.getType());
                if (motor.getEtatLabel() != null)
                    existing.setEtatLabel(motor.getEtatLabel());
                if (motor.getEtatColor() != null)
                    existing.setEtatColor(motor.getEtatColor());
                if (motor.getEtatPct() != 0)
                    existing.setEtatPct(motor.getEtatPct());
                if (motor.getVibration() != null)
                    existing.setVibration(motor.getVibration());
                if (motor.getVibrationColor() != null)
                    existing.setVibrationColor(motor.getVibrationColor());
                if (motor.getTrendIcon() != null)
                    existing.setTrendIcon(motor.getTrendIcon());
                if (motor.getRul() != 0)
                    existing.setRul(motor.getRul());
                if (motor.getRulTrend() != null)
                    existing.setRulTrend(motor.getRulTrend());
                if (motor.getPower() != null)
                    existing.setPower(motor.getPower());
                if (motor.getSpeed() != null)
                    existing.setSpeed(motor.getSpeed());
                if (motor.getLocalisation() != null)
                    existing.setLocalisation(motor.getLocalisation());
                if (motor.getSite() != null)
                    existing.setSite(motor.getSite());
                return motorRepository.save(existing);
            }).orElseGet(() -> {
                motor.setId(id);
                return motorRepository.save(motor);
            });
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @DeleteMapping("/iot/motors/{id}")
    public Mono<Void> deleteMotor(@PathVariable("id") String id) {
        return Mono.fromRunnable(() -> motorRepository.deleteById(id))
                .subscribeOn(Schedulers.boundedElastic())
                .then();
    }

    @GetMapping("/iot/motors")
    public Flux<Map<String, Object>> getMotors() {
        return Flux.defer(() -> {
            List<Motor> motors = motorRepository.findAll();
            List<Alert> allAlerts = alertRepository.findAll();

            List<Map<String, Object>> result = motors.stream().map(m -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", m.getId());
                map.put("localisation", m.getLocalisation() != null ? m.getLocalisation() : "");
                map.put("zone", m.getSite() != null ? m.getSite() : "Site Indéfini");
                map.put("type", m.getType() != null ? m.getType() : "Inconnu");
                map.put("puissance", m.getPower() != null ? m.getPower() : "N/A");

                // Map fields exactly as the frontend expects
                map.put("etatLabel", m.getEtatLabel() != null ? m.getEtatLabel() : "Normal");
                map.put("etatColor", m.getEtatColor() != null ? m.getEtatColor() : "#10B981");
                map.put("etatPct", m.getEtatPct() != 0 ? m.getEtatPct() : 100);
                map.put("vibration", m.getVibration() != null ? m.getVibration() : "0.0 mm/s");
                map.put("vibrationColor", m.getVibrationColor() != null ? m.getVibrationColor() : "#10B981");
                map.put("trendIcon", m.getTrendIcon() != null ? m.getTrendIcon() : "flat");

                // Keep these for potential analytics usage
                map.put("etatSante", map.get("etatLabel"));

                double vibVal = 0.0;
                try {
                    String vStr = m.getVibration();
                    if (vStr != null && !vStr.isEmpty()) {
                        String numeric = vStr.split(" ")[0].replaceAll("[^0-9.]", "");
                        if (!numeric.isEmpty())
                            vibVal = Double.parseDouble(numeric);
                    }
                } catch (Exception e) {
                }
                map.put("vibrationRMS", vibVal);

                // Find latest alert for this motor
                Optional<Alert> lastAlert = allAlerts.stream()
                        .filter(a -> {
                            String motorIdClean = m.getId().split(" \\(")[0].trim().toLowerCase();
                            if (a.getMotorId() != null) {
                                String alertMotorClean = a.getMotorId().split(" \\(")[0].trim().toLowerCase();
                                if (alertMotorClean.equals(motorIdClean))
                                    return true;
                            }
                            if (a.getMessage() != null && a.getMessage().toLowerCase().contains(motorIdClean))
                                return true;
                            return false;
                        })
                        .sorted((a1, a2) -> {
                            if (a1.getTime() == null || a2.getTime() == null)
                                return 0;
                            return a2.getTime().compareTo(a1.getTime());
                        })
                        .findFirst();

                if (lastAlert.isPresent()) {
                    map.put("derniereAlerte", lastAlert.get().getTime());
                    map.put("alerteRef", "#" + lastAlert.get().getId());
                } else {
                    map.put("derniereAlerte", "Aucune");
                    map.put("alerteRef", null);
                }

                return map;
            }).collect(Collectors.toList());

            return Flux.fromIterable(result);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/iot/motors/{id}")
    public Mono<ResponseEntity<Motor>> getMotorById(@PathVariable("id") String id) {
        return Mono.fromCallable(() -> motorRepository.findById(id))
                .subscribeOn(Schedulers.boundedElastic())
                .map(opt -> opt.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build()));
    }

    @GetMapping("/iot/motors/{id}/vibration")
    public Mono<List<VibrationData>> getMotorVibration(@PathVariable("id") String id) {
        return Mono.fromCallable(() -> vibrationRepository.findByMotorId(id))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/iot/kpis")
    public Mono<Map<String, Object>> getKPIs() {
        return Mono.fromCallable(() -> {
            Map<String, Object> kpis = new HashMap<>();
            long totalMotors = motorRepository.count();
            List<Motor> allMotors = motorRepository.findAll();
            long criticalMotors = allMotors.stream()
                    .filter(m -> m.getEtatLabel().contains("Critique") || m.getEtatLabel().contains("Alerte")).count();

            String today = new java.text.SimpleDateFormat("yyyy-MM-dd").format(new Date());
            long totalAlerts = alertRepository.count();
            long alertsToday = alertRepository.findAll().stream()
                    .filter(a -> a.getTime() != null && a.getTime().startsWith(today)).count();

            double uptime = 100.0 - (criticalMotors * 2.0);
            if (uptime < 0)
                uptime = 0;

            kpis.put("totalMotors", totalMotors);
            kpis.put("totalMotorsTrend", "Actualisé");

            kpis.put("criticalMotors", criticalMotors);
            kpis.put("criticalMotorsTrend", "+" + alertsToday + " alertes");

            kpis.put("alerts", totalAlerts);
            kpis.put("alertsTrend", "+" + alertsToday + " aujourd'hui");

            kpis.put("uptime", Math.round(uptime * 10.0) / 10.0 + "%");
            kpis.put("uptimeTrend", "Stable");
            kpis.put("uptimeTrendUp", true);
            return kpis;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/search")
    public Mono<Map<String, Object>> search(@RequestParam("q") String query) {
        return Mono.fromCallable(() -> {
            String q = query.toLowerCase();
            Map<String, Object> results = new HashMap<>();

            List<Motor> foundMotors = motorRepository.findAll().stream()
                    .filter(m -> m.getId().toLowerCase().contains(q) ||
                            (m.getType() != null && m.getType().toLowerCase().contains(q)))
                    .limit(5)
                    .toList();

            List<Alert> foundAlerts = alertRepository.findAll().stream()
                    .filter(a -> a.getMessage().toLowerCase().contains(q) ||
                            a.getId().toLowerCase().contains(q))
                    .limit(5)
                    .toList();

            results.put("motors", foundMotors);
            results.put("alerts", foundAlerts);
            results.put("query", query);
            return results;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/iot/vibrations")
    public Flux<VibrationData> getVibrations() {
        return Flux.defer(() -> Flux.fromIterable(vibrationRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping("/iot/vibrations")
    public Mono<VibrationData> saveVibration(@RequestBody VibrationData data) {
        return Mono.fromCallable(() -> {
            if (data.getTime() == null) {
                data.setTime(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
            }
            VibrationData saved = vibrationRepository.save(data);
            vibrationStreamService.emit(saved);
            return saved;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    // ML Endpoints
    @GetMapping("/ml/alerts")
    public Flux<Alert> getAlerts(Principal principal) {
        return Flux.defer(() -> {
            List<Alert> allAlerts = alertRepository.findAll();
            List<Alert> visible = allAlerts.stream()
                    .filter(alert -> isAllowedAlert(principal, alert))
                    .collect(Collectors.toList());
            return Flux.fromIterable(visible);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/ml/alerts/{id}")
    public Mono<ResponseEntity<Alert>> getAlertById(@PathVariable("id") String id, Principal principal) {
        return Mono.fromCallable(() -> alertRepository.findById(id))
                .subscribeOn(Schedulers.boundedElastic())
                .map(opt -> {
                    if (opt.isEmpty()) {
                        return ResponseEntity.notFound().<Alert>build();
                    }
                    Alert alert = opt.get();
                    if (!isAllowedAlert(principal, alert)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Alert>build();
                    }
                    return ResponseEntity.ok(alert);
                });
    }

    @PutMapping("/ml/alerts/{id}")
    public Mono<ResponseEntity<Alert>> updateAlert(@PathVariable("id") String id, @RequestBody Alert alert,
            Principal principal) {
        return Mono.fromCallable(() -> alertRepository.findById(id))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(opt -> {
                    if (opt.isEmpty()) {
                        return Mono.just(ResponseEntity.notFound().<Alert>build());
                    }
                    Alert existing = opt.get();
                    if (!isAllowedAlert(principal, existing)) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).<Alert>build());
                    }
                    existing.setStatus(alert.getStatus());
                    existing.setMessage(alert.getMessage());
                    existing.setLevel(alert.getLevel());
                    existing.setPriority(alert.getPriority());
                    if (alert.getVelociteRms() != null)
                        existing.setVelociteRms(alert.getVelociteRms());
                    if (alert.getAccelerationPeak() != null)
                        existing.setAccelerationPeak(alert.getAccelerationPeak());
                    if (alert.getTemperature() != null)
                        existing.setTemperature(alert.getTemperature());
                    if (alert.getScoreConfianceIA() != null)
                        existing.setScoreConfianceIA(alert.getScoreConfianceIA());
                    if (alert.getDepassementSeuil() != null)
                        existing.setDepassementSeuil(alert.getDepassementSeuil());
                    return Mono.just(ResponseEntity.ok(alertRepository.save(existing)));
                });
    }

    @PostMapping("/ml/alerts")
    public Mono<Alert> createAlert(@RequestBody Alert alert) {
        return Mono.fromCallable(() -> {
            if (alert.getId() == null) {
                alert.setId("ALR-" + UUID.randomUUID().toString().substring(0, 8));
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

    @PostMapping("/ml/alerts/{id}/read")
    public Mono<ResponseEntity<Alert>> markAlertAsRead(@PathVariable("id") String id, Principal principal) {
        return Mono.fromCallable(() -> alertRepository.findById(id))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(opt -> {
                    if (opt.isEmpty()) {
                        return Mono.just(ResponseEntity.notFound().<Alert>build());
                    }
                    Alert alert = opt.get();
                    if (!isAllowedAlert(principal, alert)) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).<Alert>build());
                    }
                    alert.setStatus("Read");
                    return Mono.just(ResponseEntity.ok(alertRepository.save(alert)));
                });
    }

    @PostMapping("/ml/alerts/mark-all-read")
    public Mono<Map<String, Object>> markAllAlertsAsRead(Principal principal) {
        return Mono.fromCallable(() -> {
            List<Alert> unread = alertRepository.findAll().stream()
                    .filter(a -> !"Read".equalsIgnoreCase(a.getStatus()))
                    .filter(a -> isAllowedAlert(principal, a))
                    .collect(java.util.stream.Collectors.toList());
            unread.forEach(a -> a.setStatus("Read"));
            alertRepository.saveAll(unread);
            Map<String, Object> result = new HashMap<>();
            result.put("ok", true);
            result.put("count", unread.size());
            return result;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    // Work Order Endpoints
    @GetMapping("/iot/work-orders")
    public Flux<WorkOrder> getWorkOrders(Principal principal) {
        return Flux.defer(() -> {
            List<WorkOrder> allWorkOrders = workOrderRepository.findAll();
            if (isAdmin(principal)) {
                return Flux.fromIterable(allWorkOrders);
            }

            Optional<User> current = currentUser(principal);
            if (current.isPresent() && isTechnician(principal)) {
                String currentName = current.get().getFullName();
                List<WorkOrder> filtered = allWorkOrders.stream()
                        .filter(wo -> currentName != null && wo.getAssignedTo() != null
                                && currentName.trim().equalsIgnoreCase(wo.getAssignedTo().trim()))
                        .collect(Collectors.toList());
                return Flux.fromIterable(filtered);
            }

            return Flux.empty();
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/iot/work-orders/{id}")
    public Mono<ResponseEntity<WorkOrder>> getWorkOrderById(@PathVariable("id") String id, Principal principal) {
        return Mono.fromCallable(() -> workOrderRepository.findById(id))
                .subscribeOn(Schedulers.boundedElastic())
                .map(opt -> {
                    if (opt.isEmpty()) {
                        return ResponseEntity.notFound().build();
                    }
                    if (!isAdmin(principal) && isTechnician(principal)) {
                        User current = currentUser(principal).orElse(null);
                        String assignedTo = opt.get().getAssignedTo();
                        if (current == null || current.getFullName() == null || assignedTo == null
                                || !current.getFullName().trim().equalsIgnoreCase(assignedTo.trim())) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                        }
                    }
                    return ResponseEntity.ok(opt.get());
                });
    }

    @PostMapping("/iot/work-orders")
    public Mono<WorkOrder> createWorkOrder(@RequestBody WorkOrder workOrder, Principal principal) {
        return Mono.fromCallable(() -> {
            if (workOrder.getId() == null) {
                workOrder.setId("W-" + (workOrderRepository.count() + 458));
            }
            if (isTechnician(principal)) {
                User current = currentUser(principal).orElse(null);
                if (current != null && current.getFullName() != null) {
                    workOrder.setAssignedTo(current.getFullName());
                }
            }
            WorkOrder saved = workOrderRepository.save(workOrder);
            maybeCreateWorkOrderNotification(saved, principal);
            return saved;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @PutMapping("/iot/work-orders/{id}")
    public Mono<WorkOrder> updateWorkOrder(@PathVariable("id") String id, @RequestBody WorkOrder workOrder,
            Principal principal) {
        return Mono.fromCallable(() -> {
            return workOrderRepository.findById(id).map(existing -> {
                existing.setTitle(workOrder.getTitle());
                existing.setAsset(workOrder.getAsset());
                existing.setStatus(workOrder.getStatus());
                existing.setPriority(workOrder.getPriority());
                if (isAdmin(principal)) {
                    existing.setAssignedTo(workOrder.getAssignedTo());
                } else if (isTechnician(principal)) {
                    User current = currentUser(principal).orElse(null);
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
                if (isTechnician(principal)) {
                    User current = currentUser(principal).orElse(null);
                    if (current != null && current.getFullName() != null) {
                        workOrder.setAssignedTo(current.getFullName());
                    }
                }
                return workOrderRepository.save(workOrder);
            });
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/iot/technicians")
    public Flux<Object> getTechnicians() {
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

    @GetMapping("/iot/technicians/{id}")
    public Mono<ResponseEntity<User>> getTechnicianById(@PathVariable("id") String id) {
        return Mono.fromCallable(() -> userRepository.findById(Long.parseLong(id)))
                .subscribeOn(Schedulers.boundedElastic())
                .map(opt -> opt.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build()));
    }

    @PutMapping("/iot/technicians/{id}")
    public Mono<ResponseEntity<User>> updateTechnician(@PathVariable("id") String id, @RequestBody User technician) {
        return Mono.fromCallable(() -> {
            Optional<User> existing = userRepository.findById(Long.parseLong(id));
            if (existing.isPresent()) {
                User u = existing.get();
                if (technician.getFullName() != null)
                    u.setFullName(technician.getFullName());
                if (technician.getEmail() != null)
                    u.setEmail(technician.getEmail());
                if (technician.getRole() != null)
                    u.setRole(technician.getRole());
                if (technician.getDepartment() != null)
                    u.setDepartment(technician.getDepartment());
                if (technician.getStatus() != null)
                    u.setStatus(technician.getStatus());
                return ResponseEntity.ok(userRepository.save(u));
            }
            return ResponseEntity.notFound().<User>build();
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @DeleteMapping("/iot/work-orders/{id}")
    public Mono<Void> deleteWorkOrder(@PathVariable("id") String id) {
        return Mono.fromRunnable(() -> workOrderRepository.deleteById(id))
                .subscribeOn(Schedulers.boundedElastic())
                .then();
    }

    @GetMapping("/iot/inventory-parts")
    public Flux<InventoryPart> getInventoryParts() {
        return Flux.defer(() -> Flux.fromIterable(inventoryPartRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping("/iot/inventory-parts")
    public Mono<InventoryPart> createInventoryPart(@RequestBody InventoryPart part) {
        return Mono.fromCallable(() -> {
            if (part.getId() == null) {
                part.setId("P-" + (inventoryPartRepository.count() + 100));
            }
            if (part.getStockColor() == null) {
                part.setStockColor(part.getStock() > 5 ? "green" : "amber");
            }
            return inventoryPartRepository.save(part);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping("/iot/inventory/decrement/{id}")
    public Mono<InventoryPart> decrementInventory(@PathVariable("id") String id) {
        return Mono.fromCallable(() -> {
            return inventoryPartRepository.findById(id).map(part -> {
                if (part.getStock() > 0) {
                    part.setStock(part.getStock() - 1);
                    if (part.getStock() == 0) {
                        part.setStockColor("red");
                    } else if (part.getStock() < 3) {
                        part.setStockColor("amber");
                    }
                    return inventoryPartRepository.save(part);
                }
                return part;
            }).orElse(null);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    // Rapports BI Endpoints
    @GetMapping("/bi/kpis")
    public Mono<Map<String, Object>> getBIKPIs() {
        return Mono.fromCallable(() -> {
            Map<String, Object> kpis = new HashMap<>();

            List<WorkOrder> workOrders = workOrderRepository.findAll();
            List<Alert> allAlerts = alertRepository.findAll();
            List<Motor> allMotors = motorRepository.findAll();
            long totalMotors = allMotors.size();

            // 1. Calculations for CURRENT data
            double totalOperatingTime = totalMotors * 720.0; // Base mensuelle (30j * 24h)
            long failures = allAlerts.stream()
                    .filter(a -> "Critique".equalsIgnoreCase(a.getLevel()) || "Danger".equalsIgnoreCase(a.getLevel()))
                    .count();

            double mtbf = failures > 0 ? totalOperatingTime / failures : totalOperatingTime;

            double totalRepairTime = workOrders.stream()
                    .filter(wo -> "Terminé".equalsIgnoreCase(wo.getStatus()) || "Clos".equalsIgnoreCase(wo.getStatus()))
                    .mapToDouble(wo -> {
                        if ("Urgent".equalsIgnoreCase(wo.getPriority()))
                            return 2.0;
                        if ("Haute".equalsIgnoreCase(wo.getPriority()))
                            return 6.0;
                        return 12.0;
                    }).sum();

            long completedWOs = workOrders.stream()
                    .filter(wo -> "Terminé".equalsIgnoreCase(wo.getStatus()) || "Clos".equalsIgnoreCase(wo.getStatus()))
                    .count();

            double mttr = completedWOs > 0 ? totalRepairTime / completedWOs : 0.0;
            double availability = (mtbf + mttr) > 0 ? (mtbf / (mtbf + mttr)) * 100.0 : 100.0;
            
            // Si aucune panne et aucun travail de réparation, la disponibilité est de 100%
            if (failures == 0 && completedWOs == 0)
                availability = 100.0;

            // 2. Trend Calculations (Comparing last 7 days vs previous 7 days)
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter
                    .ofPattern("yyyy-MM-dd HH:mm:ss");

            long failuresLast7 = allAlerts.stream()
                    .filter(a -> a.getTime() != null
                            && ("Critique".equalsIgnoreCase(a.getLevel()) || "Danger".equalsIgnoreCase(a.getLevel())))
                    .filter(a -> {
                        try {
                            return java.time.LocalDateTime.parse(a.getTime(), fmt).isAfter(now.minusDays(7));
                        } catch (Exception e) {
                            return false;
                        }
                    }).count();

            long failuresPrev7 = allAlerts.stream()
                    .filter(a -> a.getTime() != null
                            && ("Critique".equalsIgnoreCase(a.getLevel()) || "Danger".equalsIgnoreCase(a.getLevel())))
                    .filter(a -> {
                        try {
                            java.time.LocalDateTime dt = java.time.LocalDateTime.parse(a.getTime(), fmt);
                            return dt.isAfter(now.minusDays(14)) && dt.isBefore(now.minusDays(7));
                        } catch (Exception e) {
                            return false;
                        }
                    }).count();

            String mtbfTrend = "Stable";
            boolean mtbfUp = true;
            if (failuresPrev7 > 0) {
                double diff = (double) (failuresPrev7 - failuresLast7) / failuresPrev7 * 100.0;
                mtbfTrend = String.format("%+.1f%%", diff);
                mtbfUp = diff >= 0;
            } else if (failuresLast7 > 0) {
                mtbfTrend = "-100%"; // Significant increase in failures
                mtbfUp = false;
            }

            String mttrTrend = String.format("%.1fh", mttr);
            if (completedWOs == 0)
                mttrTrend = "Stable";

            // Somme réelle des coûts des ordres de travail (plus de valeur par défaut de 4500)
            double totalCostFromWOs = workOrders.stream().mapToDouble(WorkOrder::getCost).sum();

            kpis.put("mtbf", Math.round(mtbf));
            kpis.put("mtbfTrend", mtbfTrend);
            kpis.put("mtbfUp", mtbfUp);

            kpis.put("mttr", Math.round(mttr * 10.0) / 10.0);
            kpis.put("mttrTrend", mttrTrend);
            kpis.put("mttrUp", false);

            kpis.put("availability", Math.round(availability * 10.0) / 10.0);
            kpis.put("availabilityTrend",
                    availability > 99.0 ? "Optimal" : (availability > 95.0 ? "Normal" : "Critique"));
            kpis.put("availabilityUp", true);

            kpis.put("maintenanceCost", totalCostFromWOs);
            kpis.put("maintenanceCostTrend", "Réel (MAD)");
            kpis.put("maintenanceCostUp", false);

            long distinctSites = allMotors.stream()
                    .map(Motor::getSite)
                    .filter(Objects::nonNull)
                    .distinct()
                    .count();

            kpis.put("sitesConnected", distinctSites);
            kpis.put("activeAlerts", allAlerts.size());
            return kpis;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/bi/interventions")
    public Flux<Intervention> getInterventions() {
        return Mono.fromCallable(() -> {
            List<WorkOrder> wos = workOrderRepository.findAll();
            List<Motor> motors = motorRepository.findAll();

            if (wos.isEmpty()) {
                return List.of(
                        new Intervention("Préventif", 0, "#007A3D"),
                        new Intervention("Correctif", 0, "#D93F3F"));
            }

            long p = 0;
            long c = 0;

            for (WorkOrder w : wos) {
                if ("Préventif".equalsIgnoreCase(w.getType())) {
                    p++;
                } else if ("Correctif".equalsIgnoreCase(w.getType())) {
                    c++;
                } else {
                    // Dynamic heuristic: If asset name (id) matches a motor in critical state, it's
                    // corrective
                    boolean isCritical = motors.stream()
                            .filter(m -> m.getId().contains(w.getAsset()) || w.getAsset().contains(m.getId()))
                            .anyMatch(m -> m.getEtatLabel() != null
                                    && (m.getEtatLabel().contains("Critique") || m.getEtatLabel().contains("Danger")));

                    if (isCritical)
                        c++;
                    else
                        p++;
                }
            }

            return List.of(
                    new Intervention("Préventif", (int) p, "#007A3D"),
                    new Intervention("Correctif", (int) c, "#D93F3F"));
        }).flatMapMany(Flux::fromIterable).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/bi/mtbf-by-site")
    public Flux<SiteMtbf> getMtbfBySite() {
        return Flux.defer(() -> Flux.fromIterable(siteMtbfRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/bi/maintenance-costs")
    public Flux<MaintenanceCost> getMaintenanceCosts() {
        return Flux.defer(() -> Flux.fromIterable(maintenanceCostRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping("/bi/kpis/upsert")
    public Mono<KpiValue> upsertKPI(@RequestBody KpiValue kpi) {
        return Mono.fromCallable(() -> {
            return kpiValueRepository.findById(kpi.getId()).map(existing -> {
                if (kpi.getNumericValue() != null)
                    existing.setNumericValue(kpi.getNumericValue());
                if (kpi.getStringValue() != null)
                    existing.setStringValue(kpi.getStringValue());
                if (kpi.getTrend() != null)
                    existing.setTrend(kpi.getTrend());
                if (kpi.getTrendUp() != null)
                    existing.setTrendUp(kpi.getTrendUp());
                return kpiValueRepository.save(existing);
            }).orElseGet(() -> kpiValueRepository.save(kpi));
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/bi/reports")
    public Mono<List<Map<String, Object>>> getBIReports() {
        return Mono.just(new ArrayList<>()); // Stub
    }

    // Blockchain Endpoints
    @GetMapping("/blockchain/kpis")
    public Mono<Map<String, Object>> getBlockchainKPIs() {
        return Mono.fromCallable(() -> {
            Map<String, Object> kpis = new HashMap<>();
            long blocks = auditRepository.count();
            kpis.put("secureBlocks", blocks);
            kpis.put("secureBlocksTrend", "+" + blocks + " total");
            kpis.put("secureBlocksUp", true);
            kpis.put("smartContracts", siteMtbfRepository.count() + 2); // Dynamic based on sites
            kpis.put("integrityRate", 100.0);
            kpis.put("validationTime", 1.2);
            return kpis;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/blockchain/audit")
    public Flux<AuditEntry> getAuditHistory() {
        return Flux.defer(() -> Flux.fromIterable(auditRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/blockchain/traceability")
    public Flux<TraceabilityStep> getTraceability() {
        return Flux.defer(() -> Flux.fromIterable(traceabilityRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    // Report Endpoints with IPFS Integration
    @GetMapping("/reports")
    public Mono<List<Report>> getReports(Principal principal) {
        return Mono.fromCallable(() -> {
            if (isAdmin(principal)) {
                return reportRepository.findAll();
            } else {
                Optional<User> user = currentUser(principal);
                return user.map(u -> reportRepository.findByCreatedByEmail(u.getEmail()))
                        .orElse(new ArrayList<>());
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping("/reports/generate")
    public Mono<Report> generateReport(@RequestBody Map<String, String> request, Principal principal) {
        return Mono.fromCallable(() -> {
            Optional<User> user = currentUser(principal);
            if (user.isEmpty()) {
                throw new RuntimeException("User not found");
            }

            String type = request.getOrDefault("type", "pdf"); // pdf or excel
            String frequency = request.getOrDefault("frequency", "quotidien");
            String base64Content = request.getOrDefault("fileContent", "");
            if (base64Content.isEmpty()) {
                throw new RuntimeException("File content is empty");
            }

            // Clean up the base64 string from data URL prefix
            if (base64Content.contains("base64,")) {
                base64Content = base64Content.substring(base64Content.indexOf("base64,") + 7);
            }

            byte[] fileContentBytes = java.util.Base64.getDecoder().decode(base64Content);

            try {
                // Upload file to IPFS
                String fileName = "report-" + System.currentTimeMillis() + "." + type;
                String ipfsHash = ipfsService.uploadFile(fileContentBytes, fileName);

                // Create report record
                Report report = new Report();
                report.setId("RPT-" + UUID.randomUUID().toString().substring(0, 8));
                report.setTitle("Rapport " + frequency + " - " + new Date());
                report.setType(type);
                report.setFrequency(frequency);
                report.setIpfsHash(ipfsHash);
                report.setCreatedBy(user.get().getFullName());
                report.setCreatedByEmail(user.get().getEmail());
                report.setCreatedAt(System.currentTimeMillis());
                report.setShareLink(generateShareLink(report.getId()));
                report.setPublic(true);
                report.setDownloadCount(0);
                report.setStatus("stored");

                return reportRepository.save(report);
            } catch (Exception e) {
                throw new RuntimeException("Failed to generate report: " + e.getMessage());
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/reports/{id}")
    public Mono<ResponseEntity<Report>> getReportById(@PathVariable("id") String id, Principal principal) {
        return Mono.fromCallable(() -> {
            Optional<Report> report = reportRepository.findById(id);
            if (report.isEmpty()) {
                return ResponseEntity.notFound().<Report>build();
            }

            Report r = report.get();
            // Check access: admins can see all, others only their own
            // For public share links (principal == null), we allow access since this is explicitly for sharing
            if (principal != null && !isAdmin(principal)) {
                Optional<User> user = currentUser(principal);
                if (user.isEmpty() || !user.get().getEmail().equals(r.getCreatedByEmail())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).<Report>build();
                }
            }

            return ResponseEntity.ok(r);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/reports/{id}/download")
    public Mono<ResponseEntity<byte[]>> downloadReport(@PathVariable("id") String id, Principal principal) {
        return Mono.fromCallable(() -> {
            Optional<Report> report = reportRepository.findById(id);
            if (report.isEmpty()) {
                return ResponseEntity.notFound().<byte[]>build();
            }

            try {
                Report r = report.get();
                // Check access for download as well
                if (principal != null && !isAdmin(principal)) {
                    Optional<User> user = currentUser(principal);
                    if (user.isEmpty() || !user.get().getEmail().equals(r.getCreatedByEmail())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<byte[]>build();
                    }
                }
                
                byte[] content = ipfsService.downloadFile(r.getIpfsHash());

                // Increment download count
                r.setDownloadCount(r.getDownloadCount() + 1);
                reportRepository.save(r);

                return ResponseEntity.ok()
                        .header("Content-Disposition",
                                "attachment; filename=\"" + r.getTitle() + "." + r.getType() + "\"")
                        .header("Content-Type",
                                r.getType().equals("pdf") ? "application/pdf" : "application/vnd.ms-excel")
                        .body(content);
            } catch (Exception e) {
                System.err.println("Download Error for Report " + id + ": " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .header("X-Error-Reason", e.getMessage())
                        .<byte[]>build();
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @DeleteMapping("/reports/{id}")
    public Mono<ResponseEntity<Void>> deleteReport(@PathVariable("id") String id, Principal principal) {
        return Mono.fromCallable(() -> {
            Optional<Report> report = reportRepository.findById(id);
            if (report.isEmpty()) {
                return ResponseEntity.notFound().<Void>build();
            }

            Report r = report.get();
            // Only admins or report creator can delete
            if (!isAdmin(principal)) {
                Optional<User> user = currentUser(principal);
                if (user.isEmpty() || !user.get().getEmail().equals(r.getCreatedByEmail())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build();
                }
            }

            try {
                reportRepository.deleteById(id);
            } catch (Exception e) {
                System.out.println("Error deleting report: " + e.getMessage());
                throw new RuntimeException("DB Deletion failed: " + e.getMessage());
            }
            return ResponseEntity.ok().<Void>build();
        }).subscribeOn(Schedulers.boundedElastic());
    }

    private String generateShareLink(String reportId) {
        return "/reports/share/" + reportId;
    }

}
