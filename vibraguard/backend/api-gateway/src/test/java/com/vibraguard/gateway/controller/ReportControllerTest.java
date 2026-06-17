package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.auth.model.User;
import com.vibraguard.gateway.entity.Report;
import com.vibraguard.gateway.repository.ReportRepository;
import com.vibraguard.gateway.service.BlockchainReportService;
import com.vibraguard.gateway.service.IpfsService;
import com.vibraguard.gateway.util.ControllerUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportControllerTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private IpfsService ipfsService;

    @Mock
    private BlockchainReportService blockchainReportService;

    @Mock
    private ControllerUtils utils;

    private ReportController controller;

    @BeforeEach
    void setUp() {
        controller = new ReportController();
        ReflectionTestUtils.setField(controller, "reportRepository", reportRepository);
        ReflectionTestUtils.setField(controller, "ipfsService", ipfsService);
        ReflectionTestUtils.setField(controller, "blockchainReportService", blockchainReportService);
        ReflectionTestUtils.setField(controller, "utils", utils);
    }

    @Test
    void generateReportUploadsToIpfsAndAnchorsCidOnBlockchain() throws Exception {
        User user = User.builder()
                .email("tech@vibraguard.com")
                .fullName("Tech User")
                .role("TECHNICIAN")
                .build();
        Principal principal = () -> "tech@vibraguard.com";
        String encodedContent = Base64.getEncoder().encodeToString("demo report".getBytes(StandardCharsets.UTF_8));

        when(utils.currentUser(principal)).thenReturn(Optional.of(user));
        when(ipfsService.uploadFile(any(), any())).thenReturn("bafy-report-cid");
        when(blockchainReportService.storeReportCid(any(), eq("bafy-report-cid"))).thenReturn("0xtxhash");
        when(reportRepository.save(any(Report.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Report result = controller.generateReport(
                Map.of("type", "pdf", "frequency", "mensuel", "fileContent", encodedContent),
                principal
        ).block();

        ArgumentCaptor<Report> reportCaptor = ArgumentCaptor.forClass(Report.class);
        verify(reportRepository).save(reportCaptor.capture());
        Report savedReport = reportCaptor.getValue();

        verify(blockchainReportService).storeReportCid(savedReport.getId(), "bafy-report-cid");
        assertNotNull(result);
        assertEquals(savedReport.getId(), result.getId());
        assertEquals("bafy-report-cid", result.getIpfsHash());
        assertEquals("0xtxhash", result.getBlockchainTxHash());
        assertEquals("anchored", result.getStatus());
        assertEquals("Tech User", result.getCreatedBy());
        assertEquals("tech@vibraguard.com", result.getCreatedByEmail());
    }
}
