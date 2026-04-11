package com.vibraguard.gateway.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class IpfsService {

    @Value("${ipfs.api.url:http://localhost:5001}")
    private String ipfsApiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Upload file content to IPFS and return the IPFS hash
     */
    public String uploadFile(byte[] fileContent, String fileName) throws Exception {
        String uploadUrl = ipfsApiUrl + "/api/v0/add";
        
        HttpURLConnection conn = (HttpURLConnection) new URL(uploadUrl).openConnection();
        conn.setRequestMethod("POST");
        conn.setDoOutput(true);
        conn.setRequestProperty("Connection", "Keep-Alive");
        
        String boundary = "----FormBoundary" + System.currentTimeMillis();
        conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);
        
        // Build multipart form data
        String contentDisposition = "--" + boundary + "\r\n" +
                "Content-Disposition: form-data; name=\"file\"; filename=\"" + fileName + "\"\r\n" +
                "Content-Type: application/octet-stream\r\n\r\n";
        
        String endBoundary = "\r\n--" + boundary + "--\r\n";
        
        try (java.io.OutputStream os = conn.getOutputStream()) {
            os.write(contentDisposition.getBytes());
            os.write(fileContent);
            os.write(endBoundary.getBytes());
        }
        
        int responseCode = conn.getResponseCode();
        if (responseCode != 200) {
            throw new Exception("IPFS upload failed with status: " + responseCode);
        }
        
        try (InputStream is = conn.getInputStream()) {
            Map<String, Object> response = objectMapper.readValue(is, Map.class);
            Object hash = response.get("Hash");
            if (hash == null) {
                throw new Exception("IPFS response missing Hash field");
            }
            return hash.toString();
        }
    }

    /**
     * Retrieve file from IPFS using the hash
     */
    public byte[] downloadFile(String ipfsHash) throws Exception {
        String downloadUrl = ipfsApiUrl + "/api/v0/cat?arg=" + ipfsHash;
        
        HttpURLConnection conn = (HttpURLConnection) new URL(downloadUrl).openConnection();
        conn.setRequestMethod("GET");
        
        int responseCode = conn.getResponseCode();
        if (responseCode != 200) {
            throw new Exception("IPFS download failed with status: " + responseCode);
        }
        
        try (InputStream is = conn.getInputStream()) {
            return is.readAllBytes();
        }
    }

    /**
     * Generate a shareable IPFS gateway URL
     */
    public String generateShareableUrl(String ipfsHash) {
        // Using public IPFS gateway
        return "https://ipfs.io/ipfs/" + ipfsHash;
    }
}
