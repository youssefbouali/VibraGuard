package com.vibraguard.blockchain;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@SpringBootApplication
@RestController
@RequestMapping("/api/v1/blockchain")
public class BlockchainApplication {

    public static void main(String[] args) {
        SpringApplication.run(BlockchainApplication.class, args);
    }

    @GetMapping("/audit")
    public List<Map<String, Object>> getAuditHistory() {
        List<Map<String, Object>> audit = new ArrayList<>();
        
        audit.add(createAuditEntry("0x7a8b...2c", "Ajout de capteur SN-203", "Expert Maintenance", "20/05/2026 14:30", "Validé"));
        audit.add(createAuditEntry("0x1d2e...4f", "Modification seuil alerte MTR-04", "Administrateur", "19/05/2026 09:15", "Validé"));
        audit.add(createAuditEntry("0x3f4g...1h", "Clôture ordre de travail W-455", "Agent Maintenance", "18/05/2026 16:45", "Validé"));
        
        return audit;
    }

    private Map<String, Object> createAuditEntry(String hash, String action, String user, String date, String status) {
        Map<String, Object> entry = new HashMap<>();
        entry.put("hash", hash);
        entry.put("action", action);
        entry.put("user", user);
        entry.put("date", date);
        entry.put("status", status);
        return entry;
    }
}
