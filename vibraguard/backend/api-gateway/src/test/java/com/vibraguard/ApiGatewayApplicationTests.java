package com.vibraguard;

import com.vibraguard.gateway.ApiGatewayApplication;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = ApiGatewayApplication.class)
@ActiveProfiles("test")
public class ApiGatewayApplicationTests {

    @Test
    public void contextLoads() {
        // Test that the application context loads successfully
    }
}
