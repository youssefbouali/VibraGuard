package com.vibraguard.gateway;

import com.vibraguard.gateway.ApiGatewayApplication;
import com.vibraguard.gateway.repository.VibrationRepository;
import com.vibraguard.gateway.repository.VibrationSearchRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = ApiGatewayApplication.class)
@ActiveProfiles("test")
public class GatewayRouteConfigTests {

    @MockBean
    private VibrationSearchRepository vibrationSearchRepository;

    @MockBean
    private VibrationRepository vibrationRepository;

    @Autowired
    private RouteLocator routeLocator;

    @Test
    public void testRouteLocatorExists() {
        assertNotNull(routeLocator);
    }
}
