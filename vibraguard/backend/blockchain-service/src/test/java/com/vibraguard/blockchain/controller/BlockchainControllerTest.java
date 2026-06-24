package com.vibraguard.blockchain.controller;

import com.vibraguard.blockchain.entity.AuditEntry;
import com.vibraguard.blockchain.entity.Report;
import com.vibraguard.blockchain.entity.SiteMtbf;
import com.vibraguard.blockchain.entity.TraceabilityStep;
import com.vibraguard.blockchain.repository.AuditRepository;
import com.vibraguard.blockchain.repository.ReportRepository;
import com.vibraguard.blockchain.repository.SiteMtbfRepository;
import com.vibraguard.blockchain.repository.TraceabilityRepository;
import com.vibraguard.blockchain.service.BlockchainReportService;
import com.vibraguard.blockchain.service.IpfsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BlockchainControllerTest {

    @Mock private AuditRepository auditRepository;
    @Mock private SiteMtbfRepository siteMtbfRepository;
    @Mock private TraceabilityRepository traceabilityRepository;

    private BlockchainController controller;

    @BeforeEach
    void setUp() {
        controller = new BlockchainController();
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "auditRepository", auditRepository);
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "siteMtbfRepository", siteMtbfRepository);
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "traceabilityRepository", traceabilityRepository);
    }

    @Test
    void getBlockchainKPIs_shouldReturnAllKeys() {
        when(auditRepository.count()).thenReturn(5L);
        when(siteMtbfRepository.count()).thenReturn(3L);

        Map<String, Object> kpis = controller.getBlockchainKPIs();

        assertEquals(5L, kpis.get("secureBlocks"));
        assertEquals(5L, ((Number) kpis.get("smartContracts")).longValue());
        assertEquals(100.0, kpis.get("integrityRate"));
        assertEquals(1.2, kpis.get("validationTime"));
    }

    @Test
    void getAuditHistory_shouldReturnAll() {
        AuditEntry entry = new AuditEntry();
        when(auditRepository.findAll()).thenReturn(List.of(entry));
        assertEquals(1, controller.getAuditHistory().size());
    }

    @Test
    void getTraceability_shouldReturnAll() {
        TraceabilityStep step = new TraceabilityStep();
        when(traceabilityRepository.findAll()).thenReturn(List.of(step));
        assertEquals(1, controller.getTraceability().size());
    }

    @Test
    void getBlockchainKPIs_withZeroAudits_shouldReturnZero() {
        when(auditRepository.count()).thenReturn(0L);
        when(siteMtbfRepository.count()).thenReturn(0L);

        Map<String, Object> kpis = controller.getBlockchainKPIs();
        assertEquals(0L, kpis.get("secureBlocks"));
        assertEquals(2L, ((Number) kpis.get("smartContracts")).longValue());
    }
}
