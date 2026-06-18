package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.entity.AuditEntry;
import com.vibraguard.gateway.entity.TraceabilityStep;
import com.vibraguard.gateway.repository.AuditRepository;
import com.vibraguard.gateway.repository.SiteMtbfRepository;
import com.vibraguard.gateway.repository.TraceabilityRepository;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BlockchainControllerTest {

    @Test
    void returnsKpisAndAuditAndTraceability() {
        AuditRepository auditRepository = mock(AuditRepository.class);
        SiteMtbfRepository siteMtbfRepository = mock(SiteMtbfRepository.class);
        TraceabilityRepository traceabilityRepository = mock(TraceabilityRepository.class);

        BlockchainController controller = new BlockchainController();
        ReflectionTestUtils.setField(controller, "auditRepository", auditRepository);
        ReflectionTestUtils.setField(controller, "siteMtbfRepository", siteMtbfRepository);
        ReflectionTestUtils.setField(controller, "traceabilityRepository", traceabilityRepository);

        when(auditRepository.count()).thenReturn(5L);
        when(siteMtbfRepository.count()).thenReturn(1L);
        when(auditRepository.findAll()).thenReturn(List.of(new AuditEntry()));
        when(traceabilityRepository.findAll()).thenReturn(List.of(new TraceabilityStep()));

        Map<String, Object> kpis = controller.getBlockchainKPIs().block();
        assertNotNull(kpis);
        assertEquals(5L, kpis.get("secureBlocks"));
        assertEquals(3L, kpis.get("smartContracts"));

        var audit = controller.getAuditHistory().collectList().block();
        assertNotNull(audit);
        assertEquals(1, audit.size());

        var trace = controller.getTraceability().collectList().block();
        assertNotNull(trace);
        assertEquals(1, trace.size());
    }
}

