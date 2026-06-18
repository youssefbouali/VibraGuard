package com.vibraguard.gateway.auth.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    @Test
    void generatesAndValidatesToken() {
        JwtUtil jwtUtil = new JwtUtil();

        String token = jwtUtil.generateToken("user@example.com");

        assertNotNull(token);
        assertEquals("user@example.com", jwtUtil.extractEmail(token));
        assertTrue(jwtUtil.validateToken(token, "user@example.com"));
        assertFalse(jwtUtil.validateToken(token, "other@example.com"));
        assertNotNull(jwtUtil.extractExpiration(token));
    }

    @Test
    void throwsOnInvalidToken() {
        JwtUtil jwtUtil = new JwtUtil();
        assertThrows(Exception.class, () -> jwtUtil.extractEmail("not-a-jwt"));
    }
}

