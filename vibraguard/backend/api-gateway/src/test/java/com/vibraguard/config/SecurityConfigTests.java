package com.vibraguard.config;

import com.vibraguard.gateway.ApiGatewayApplication;
import com.vibraguard.gateway.repository.VibrationRepository;
import com.vibraguard.gateway.repository.VibrationSearchRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = ApiGatewayApplication.class)
@ActiveProfiles("test")
public class SecurityConfigTests {

    @MockBean
    private VibrationSearchRepository vibrationSearchRepository;

    @MockBean
    private VibrationRepository vibrationRepository;

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
