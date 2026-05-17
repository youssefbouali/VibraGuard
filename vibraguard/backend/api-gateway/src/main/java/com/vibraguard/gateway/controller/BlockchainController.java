package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.entity.*;
import com.vibraguard.gateway.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

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
    public Mono<Map<String, Object>> getBlockchainKPIs() {
        return Mono.fromCallable(() -> {
            Map<String, Object> kpis = new HashMap<>();
            long blocks = auditRepository.count();
            kpis.put("secureBlocks", blocks);
            kpis.put("secureBlocksTrend", "+" + blocks + " total");
            kpis.put("secureBlocksUp", true);
            kpis.put("smartContracts", siteMtbfRepository.count() + 2); 
            kpis.put("integrityRate", 100.0);
            kpis.put("validationTime", 1.2);
            return kpis;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/audit")
    public Flux<AuditEntry> getAuditHistory() {
        return Flux.defer(() -> Flux.fromIterable(auditRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/traceability")
    public Flux<TraceabilityStep> getTraceability() {
        return Flux.defer(() -> Flux.fromIterable(traceabilityRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }
}
