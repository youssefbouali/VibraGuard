package com.vibraguard.blockchain.controller;

import com.vibraguard.blockchain.entity.*;
import com.vibraguard.blockchain.repository.*;
import com.vibraguard.blockchain.service.BlockchainReportService;
import com.vibraguard.blockchain.service.IpfsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;
    @Autowired
    private IpfsService ipfsService;
    @Autowired
    private BlockchainReportService blockchainReportService;

    @GetMapping
    public List<Report> getReports() {
        return reportRepository.findAll();
    }

    @PostMapping("/generate")
    public Report generateReport(@RequestBody Map<String, String> request) {
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
            String reportId = "RPT-" + UUID.randomUUID().toString().substring(0, 8);
            String blockchainTxHash = blockchainReportService.storeReportCid(reportId, ipfsHash);

            Report report = new Report();
            report.setId(reportId);
            report.setTitle("Rapport " + frequency + " - " + new Date());
            report.setType(type);
            report.setFrequency(frequency);
            report.setIpfsHash(ipfsHash);
            report.setBlockchainTxHash(blockchainTxHash);
            report.setCreatedBy(request.getOrDefault("createdBy", "System"));
            report.setCreatedByEmail(request.getOrDefault("createdByEmail", "system@vibraguard.com"));
            report.setCreatedAt(System.currentTimeMillis());
            report.setShareLink("/reports/share/" + report.getId());
            report.setPublic(true);
            report.setDownloadCount(0);
            report.setStatus("anchored");

            return reportRepository.save(report);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate report: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Report> getReportById(@PathVariable("id") String id) {
        return reportRepository.findById(id)
                .map(r -> ResponseEntity.ok(r))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadReport(@PathVariable("id") String id) {
        Optional<Report> report = reportRepository.findById(id);
        if (report.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        try {
            Report r = report.get();
            byte[] content = ipfsService.downloadFile(r.getIpfsHash());
            r.setDownloadCount(r.getDownloadCount() + 1);
            reportRepository.save(r);

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + r.getTitle() + "." + r.getType() + "\"")
                    .header("Content-Type", r.getType().equals("pdf") ? "application/pdf" : "application/vnd.ms-excel")
                    .body(content);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("X-Error-Reason", e.getMessage())
                    .build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable("id") String id) {
        Optional<Report> report = reportRepository.findById(id);
        if (report.isEmpty()) return ResponseEntity.notFound().build();
        reportRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
