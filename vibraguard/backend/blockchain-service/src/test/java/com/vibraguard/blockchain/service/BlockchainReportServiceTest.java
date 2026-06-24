package com.vibraguard.blockchain.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import java.math.BigInteger;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class BlockchainReportServiceTest {

    private BlockchainReportService blockchainReportService;

    @BeforeEach
    void setUp() {
        blockchainReportService = new BlockchainReportService();
        ReflectionTestUtils.setField(blockchainReportService, "blockchainRpcUrl", "http://localhost:8545");
        ReflectionTestUtils.setField(blockchainReportService, "chainId", 31337L);
        ReflectionTestUtils.setField(blockchainReportService, "gasLimit", BigInteger.valueOf(500000));
    }

    @Test
    void storeReportCid_withNullReportId_shouldThrow() {
        Exception ex = assertThrows(IllegalArgumentException.class,
                () -> blockchainReportService.storeReportCid(null, "QmTest"));
        assertTrue(ex.getMessage().contains("Report ID"));
    }

    @Test
    void storeReportCid_withBlankReportId_shouldThrow() {
        Exception ex = assertThrows(IllegalArgumentException.class,
                () -> blockchainReportService.storeReportCid("", "QmTest"));
        assertTrue(ex.getMessage().contains("Report ID"));
    }

    @Test
    void storeReportCid_withNullIpfsCid_shouldThrow() {
        Exception ex = assertThrows(IllegalArgumentException.class,
                () -> blockchainReportService.storeReportCid("RPT-001", null));
        assertTrue(ex.getMessage().contains("IPFS CID"));
    }

    @Test
    void storeReportCid_withBlankIpfsCid_shouldThrow() {
        Exception ex = assertThrows(IllegalArgumentException.class,
                () -> blockchainReportService.storeReportCid("RPT-001", ""));
        assertTrue(ex.getMessage().contains("IPFS CID"));
    }

    @Test
    void storeReportCid_withoutPrivateKey_shouldThrow() {
        Exception ex = assertThrows(IllegalStateException.class,
                () -> blockchainReportService.storeReportCid("RPT-001", "QmTest123"));
        assertTrue(ex.getMessage().contains("private key"));
    }
}
