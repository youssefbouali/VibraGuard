package com.vibraguard.blockchain.controller;

import com.vibraguard.blockchain.entity.Report;
import com.vibraguard.blockchain.repository.ReportRepository;
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
class ReportControllerTest {

    @Mock private ReportRepository reportRepository;
    @Mock private IpfsService ipfsService;
    @Mock private BlockchainReportService blockchainReportService;

    private ReportController controller;

    @BeforeEach
    void setUp() {
        controller = new ReportController();
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "reportRepository", reportRepository);
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "ipfsService", ipfsService);
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "blockchainReportService", blockchainReportService);
    }

    @Test
    void getReports_shouldReturnAll() {
        Report report = new Report();
        report.setId("RPT-001");
        when(reportRepository.findAll()).thenReturn(List.of(report));

        List<Report> result = controller.getReports();
        assertEquals(1, result.size());
        assertEquals("RPT-001", result.get(0).getId());
    }

    @Test
    void getReportById_whenExists_shouldReturn() {
        Report report = new Report();
        report.setId("RPT-001");
        when(reportRepository.findById("RPT-001")).thenReturn(Optional.of(report));

        ResponseEntity<Report> response = controller.getReportById("RPT-001");
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("RPT-001", response.getBody().getId());
    }

    @Test
    void getReportById_whenNotFound_shouldReturn404() {
        when(reportRepository.findById("RPT-999")).thenReturn(Optional.empty());
        ResponseEntity<Report> response = controller.getReportById("RPT-999");
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void deleteReport_whenExists_shouldDelete() {
        Report report = new Report();
        report.setId("RPT-001");
        when(reportRepository.findById("RPT-001")).thenReturn(Optional.of(report));

        ResponseEntity<Void> response = controller.deleteReport("RPT-001");
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(reportRepository).deleteById("RPT-001");
    }

    @Test
    void deleteReport_whenNotFound_shouldReturn404() {
        when(reportRepository.findById("RPT-999")).thenReturn(Optional.empty());
        ResponseEntity<Void> response = controller.deleteReport("RPT-999");
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(reportRepository, never()).deleteById(any());
    }

    @Test
    void generateReport_withValidBase64_shouldCreateReport() throws Exception {
        Map<String, String> request = Map.of(
                "type", "pdf",
                "frequency", "quotidien",
                "fileContent", "dGVzdCBjb250ZW50",
                "createdBy", "Admin",
                "createdByEmail", "admin@test.com"
        );

        when(ipfsService.uploadFile(any(), any())).thenReturn("QmHash");
        when(blockchainReportService.storeReportCid(any(), any())).thenReturn("0xTxHash");
        when(reportRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Report result = controller.generateReport(request);
        assertTrue(result.getTitle().startsWith("Rapport quotidien"));
        assertEquals("pdf", result.getType());
        assertEquals("QmHash", result.getIpfsHash());
        assertEquals("0xTxHash", result.getBlockchainTxHash());
        assertEquals("anchored", result.getStatus());
    }

    @Test
    void generateReport_withEmptyContent_shouldThrow() {
        Map<String, String> request = Map.of("fileContent", "");
        assertThrows(RuntimeException.class, () -> controller.generateReport(request));
    }

    @Test
    void downloadReport_whenExists_shouldReturnFile() throws Exception {
        Report report = new Report();
        report.setId("RPT-001");
        report.setIpfsHash("QmHash");
        report.setTitle("Test Report");
        report.setType("pdf");
        report.setDownloadCount(0);
        when(reportRepository.findById("RPT-001")).thenReturn(Optional.of(report));
        when(ipfsService.downloadFile("QmHash")).thenReturn("PDF content".getBytes());
        when(reportRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        ResponseEntity<byte[]> response = controller.downloadReport("RPT-001");
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, report.getDownloadCount());
    }

    @Test
    void downloadReport_whenNotFound_shouldReturn404() {
        when(reportRepository.findById("RPT-999")).thenReturn(Optional.empty());
        ResponseEntity<byte[]> response = controller.downloadReport("RPT-999");
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}
