package com.vibraguard.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class SecurityConfigTests {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    public void testPasswordEncoderExists() {
        assertNotNull(passwordEncoder);
    }

    @Test
    public void testPasswordEncoding() {
        String rawPassword = "testPassword123";
        String encodedPassword = passwordEncoder.encode(rawPassword);
        
        assertNotNull(encodedPassword);
        assert(!encodedPassword.equals(rawPassword));
        assert(passwordEncoder.matches(rawPassword, encodedPassword));
    }
}
