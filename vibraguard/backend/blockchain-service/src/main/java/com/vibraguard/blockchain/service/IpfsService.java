package com.vibraguard.blockchain.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class IpfsService {

    @Value("${ipfs.api.url:http://localhost:5001}")
    private String ipfsApiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String uploadFile(byte[] fileContent, String fileName) throws Exception {
        String uploadUrl = ipfsApiUrl + "/api/v0/add";

        HttpURLConnection conn = (HttpURLConnection) new URL(uploadUrl).openConnection();
        conn.setRequestMethod("POST");
        conn.setDoOutput(true);
        conn.setRequestProperty("Connection", "Keep-Alive");

        String boundary = "----FormBoundary" + System.currentTimeMillis();
        conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

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

    public byte[] downloadFile(String ipfsHash) throws Exception {
        String downloadUrl = ipfsApiUrl + "/api/v0/cat?arg=" + ipfsHash;

        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(downloadUrl).openConnection();
            conn.setRequestMethod("POST");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(15000);

            int responseCode = conn.getResponseCode();
            if (responseCode != 200) {
                String errorMsg = "";
                try (InputStream es = conn.getErrorStream()) {
                    if (es != null) {
                        errorMsg = new String(es.readAllBytes());
                    }
                } catch (Exception ignore) {}
                System.err.println("IPFS Download failed. Status: " + responseCode + " Error: " + errorMsg);
                throw new Exception("IPFS download failed (" + responseCode + "): " + errorMsg);
            }

            try (InputStream is = conn.getInputStream()) {
                return is.readAllBytes();
            }
        } catch (Exception e) {
            System.err.println("IPFS Error: " + e.getMessage());
            throw e;
        }
    }

    public String generateShareableUrl(String ipfsHash) {
        return "https://ipfs.io/ipfs/" + ipfsHash;
    }
}
