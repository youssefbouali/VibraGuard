package com.vibraguard.common.util;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Date;
import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
    }

    @Test
    void generateToken_shouldReturnValidToken() {
        String token = jwtUtil.generateToken("user@test.com");
        assertNotNull(token);
        assertTrue(token.contains("."));
        assertEquals(3, token.split("\\.").length);
    }

    @Test
    void extractEmail_shouldReturnCorrectEmail() {
        String token = jwtUtil.generateToken("user@test.com");
        assertEquals("user@test.com", jwtUtil.extractEmail(token));
    }

    @Test
    void validateToken_withCorrectEmail_shouldReturnTrue() {
        String token = jwtUtil.generateToken("user@test.com");
        assertTrue(jwtUtil.validateToken(token, "user@test.com"));
    }

    @Test
    void validateToken_withWrongEmail_shouldReturnFalse() {
        String token = jwtUtil.generateToken("user@test.com");
        assertFalse(jwtUtil.validateToken(token, "wrong@test.com"));
    }

    @Test
    void extractExpiration_shouldReturnFutureDate() {
        String token = jwtUtil.generateToken("user@test.com");
        Date expiration = jwtUtil.extractExpiration(token);
        assertTrue(expiration.after(new Date()));
    }

    @Test
    void extractClaim_shouldReturnSubject() {
        String token = jwtUtil.generateToken("user@test.com");
        String email = jwtUtil.extractClaim(token, Claims::getSubject);
        assertEquals("user@test.com", email);
    }

    @Test
    void extractClaim_shouldReturnExpiration() {
        String token = jwtUtil.generateToken("user@test.com");
        Date expiration = jwtUtil.extractClaim(token, Claims::getExpiration);
        assertNotNull(expiration);
        assertTrue(expiration.after(new Date()));
    }
}
