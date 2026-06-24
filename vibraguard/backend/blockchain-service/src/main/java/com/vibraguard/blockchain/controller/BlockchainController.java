package com.vibraguard.blockchain.controller;

import com.vibraguard.blockchain.entity.*;
import com.vibraguard.blockchain.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/blockchain")
public class BlockchainController {

    @Autowired
    private AuditRepository auditRepository;
    @Autowired
    private SiteMtbfRepository siteMtbfRepository;
    @Autowired
    private TraceabilityRepository traceabilityRepository;

    @GetMapping("/kpis")
    public Map<String, Object> getBlockchainKPIs() {
        Map<String, Object> kpis = new HashMap<>();
        long blocks = auditRepository.count();
        kpis.put("secureBlocks", blocks);
        kpis.put("secureBlocksTrend", "+" + blocks + " total");
        kpis.put("secureBlocksUp", true);
        kpis.put("smartContracts", siteMtbfRepository.count() + 2);
        kpis.put("integrityRate", 100.0);
        kpis.put("validationTime", 1.2);
        return kpis;
    }

    @GetMapping("/audit")
    public List<AuditEntry> getAuditHistory() {
        return auditRepository.findAll();
    }

    @GetMapping("/traceability")
    public List<TraceabilityStep> getTraceability() {
        return traceabilityRepository.findAll();
    }
}
