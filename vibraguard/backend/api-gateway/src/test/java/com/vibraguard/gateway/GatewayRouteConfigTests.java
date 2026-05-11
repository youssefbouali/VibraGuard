package com.vibraguard.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.RouteLocator;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class GatewayRouteConfigTests {

    @Autowired
    private RouteLocator routeLocator;

    @Test
    public void testRouteLocatorExists() {
        assertNotNull(routeLocator);
    }
}
