package com.vibraguard.blockchain.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class IpfsServiceTest {

    private IpfsService ipfsService;

    @BeforeEach
    void setUp() {
        ipfsService = new IpfsService();
        ReflectionTestUtils.setField(ipfsService, "ipfsApiUrl", "http://localhost:5001");
    }

    @Test
    void generateShareableUrl_shouldReturnIpfsUrl() {
        String url = ipfsService.generateShareableUrl("QmTest123");
        assertEquals("https://ipfs.io/ipfs/QmTest123", url);
    }

    @Test
    void generateShareableUrl_withEmptyHash_shouldReturnUrl() {
        String url = ipfsService.generateShareableUrl("");
        assertEquals("https://ipfs.io/ipfs/", url);
    }

    @Test
    void uploadFile_whenServerDown_shouldThrow() {
        byte[] content = "test".getBytes();
        Exception ex = assertThrows(Exception.class,
                () -> ipfsService.uploadFile(content, "test.txt"));
    }

    @Test
    void downloadFile_whenServerDown_shouldThrow() {
        Exception ex = assertThrows(Exception.class,
                () -> ipfsService.downloadFile("QmTest123"));
    }
}
