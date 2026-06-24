package com.vibraguard.auth.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void handleRuntimeException_withUserNotFound_shouldReturn401() {
        RuntimeException ex = new RuntimeException("User not found");
        ResponseEntity<Map<String, Object>> response = handler.handleRuntimeException(ex);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals(401, response.getBody().get("status"));
    }

    @Test
    void handleRuntimeException_withInvalidPassword_shouldReturn401() {
        RuntimeException ex = new RuntimeException("Invalid password");
        ResponseEntity<Map<String, Object>> response = handler.handleRuntimeException(ex);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void handleRuntimeException_withInactiveAccount_shouldReturn403() {
        RuntimeException ex = new RuntimeException("Votre compte est inactif. Veuillez contacter l'administrateur.");
        ResponseEntity<Map<String, Object>> response = handler.handleRuntimeException(ex);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals(403, response.getBody().get("status"));
    }

    @Test
    void handleRuntimeException_withUserAlreadyExists_shouldReturn409() {
        RuntimeException ex = new RuntimeException("User already exists");
        ResponseEntity<Map<String, Object>> response = handler.handleRuntimeException(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals(409, response.getBody().get("status"));
    }

    @Test
    void handleRuntimeException_withGenericError_shouldReturn500() {
        RuntimeException ex = new RuntimeException("Something went wrong");
        ResponseEntity<Map<String, Object>> response = handler.handleRuntimeException(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals(500, response.getBody().get("status"));
        assertEquals("Something went wrong", response.getBody().get("message"));
    }

    @Test
    void handleRuntimeException_shouldIncludeTimestamp() {
        RuntimeException ex = new RuntimeException("User not found");
        ResponseEntity<Map<String, Object>> response = handler.handleRuntimeException(ex);

        assertNotNull(response.getBody().get("timestamp"));
        assertTrue(response.getBody().containsKey("error"));
    }
}
