package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.entity.*;
import com.vibraguard.gateway.repository.*;
import com.vibraguard.gateway.auth.model.User;
import com.vibraguard.gateway.service.IpfsService;
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
@RequestMapping("/api/v1/reports")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;
    @Autowired
    private IpfsService ipfsService;
    @Autowired
    private ControllerUtils utils;

    @GetMapping
    public Mono<List<Report>> getReports(Principal principal) {
        return Mono.fromCallable(() -> {
            if (utils.isAdmin(principal)) {
                return reportRepository.findAll();
            } else {
                Optional<User> user = utils.currentUser(principal);
                return user.map(u -> reportRepository.findByCreatedByEmail(u.getEmail()))
                        .orElse(new ArrayList<>());
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping("/generate")
    public Mono<Report> generateReport(@RequestBody Map<String, String> request, Principal principal) {
        return Mono.fromCallable(() -> {
            Optional<User> user = utils.currentUser(principal);
            if (user.isEmpty()) throw new RuntimeException("User not found");

            String type = request.getOrDefault("type", "pdf");
            String frequency = request.getOrDefault("frequency", "quotidien");
            String base64Content = request.getOrDefault("fileContent", "");
            if (base64Content.isEmpty()) throw new RuntimeException("File content is empty");

            if (base64Content.contains("base64,")) {
                base64Content = base64Content.substring(base64Content.indexOf("base64,") + 7);
            }

            byte[] fileContentBytes = java.util.Base64.getDecoder().decode(base64Content);

            try {
                String fileName = "report-" + System.currentTimeMillis() + "." + type;
                String ipfsHash = ipfsService.uploadFile(fileContentBytes, fileName);

                Report report = new Report();
                report.setId("RPT-" + UUID.randomUUID().toString().substring(0, 8));
                report.setTitle("Rapport " + frequency + " - " + new Date());
                report.setType(type);
                report.setFrequency(frequency);
                report.setIpfsHash(ipfsHash);
                report.setCreatedBy(user.get().getFullName());
                report.setCreatedByEmail(user.get().getEmail());
                report.setCreatedAt(System.currentTimeMillis());
                report.setShareLink("/reports/share/" + report.getId());
                report.setPublic(true);
                report.setDownloadCount(0);
                report.setStatus("stored");

                return reportRepository.save(report);
            } catch (Exception e) {
                throw new RuntimeException("Failed to generate report: " + e.getMessage());
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<Report>> getReportById(@PathVariable("id") String id, Principal principal) {
        return Mono.<ResponseEntity<Report>>fromCallable(() -> {
            Optional<Report> report = reportRepository.findById(id);
            if (report.isEmpty()) return ResponseEntity.notFound().<Report>build();

            Report r = report.get();
            if (principal != null && !utils.isAdmin(principal)) {
                Optional<User> user = utils.currentUser(principal);
                if (user.isEmpty() || !user.get().getEmail().equals(r.getCreatedByEmail())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).<Report>build();
                }
            }
            return ResponseEntity.ok(r);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/{id}/download")
    public Mono<ResponseEntity<byte[]>> downloadReport(@PathVariable("id") String id, Principal principal) {
        return Mono.<ResponseEntity<byte[]>>fromCallable(() -> {
            Optional<Report> report = reportRepository.findById(id);
            if (report.isEmpty()) return ResponseEntity.notFound().<byte[]>build();

            try {
                Report r = report.get();
                if (principal != null && !utils.isAdmin(principal)) {
                    Optional<User> user = utils.currentUser(principal);
                    if (user.isEmpty() || !user.get().getEmail().equals(r.getCreatedByEmail())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<byte[]>build();
                    }
                }
                
                byte[] content = ipfsService.downloadFile(r.getIpfsHash());
                r.setDownloadCount(r.getDownloadCount() + 1);
                reportRepository.save(r);

                return ResponseEntity.ok()
                        .header("Content-Disposition", "attachment; filename=\"" + r.getTitle() + "." + r.getType() + "\"")
                        .header("Content-Type", r.getType().equals("pdf") ? "application/pdf" : "application/vnd.ms-excel")
                        .body(content);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).<byte[]>header("X-Error-Reason", e.getMessage()).build();
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteReport(@PathVariable("id") String id, Principal principal) {
        return Mono.<ResponseEntity<Void>>fromCallable(() -> {
            Optional<Report> report = reportRepository.findById(id);
            if (report.isEmpty()) return ResponseEntity.notFound().<Void>build();

            Report r = report.get();
            if (!utils.isAdmin(principal)) {
                Optional<User> user = utils.currentUser(principal);
                if (user.isEmpty() || !user.get().getEmail().equals(r.getCreatedByEmail())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build();
                }
            }
            reportRepository.deleteById(id);
            return ResponseEntity.ok().<Void>build();
        }).subscribeOn(Schedulers.boundedElastic());
    }
}
