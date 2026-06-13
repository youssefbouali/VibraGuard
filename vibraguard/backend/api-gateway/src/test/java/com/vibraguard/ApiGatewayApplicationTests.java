package com.vibraguard;

import com.vibraguard.gateway.ApiGatewayApplication;
import com.vibraguard.gateway.repository.VibrationRepository;
import com.vibraguard.gateway.repository.VibrationSearchRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = ApiGatewayApplication.class)
@ActiveProfiles("test")
public class ApiGatewayApplicationTests {

    @MockBean
    private VibrationSearchRepository vibrationSearchRepository;

    @MockBean
    private VibrationRepository vibrationRepository;

    @Test
    public void contextLoads() {
        // Test that the application context loads successfully
    }
}
