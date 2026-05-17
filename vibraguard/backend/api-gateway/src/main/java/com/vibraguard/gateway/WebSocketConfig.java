package com.vibraguard.gateway;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.server.support.WebSocketHandlerAdapter;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class WebSocketConfig {

    @Autowired
    private VibrationWebSocketHandler vibrationWebSocketHandler;

    @Autowired
    private AlertWebSocketHandler alertWebSocketHandler;

    @Bean
    public HandlerMapping webSocketHandlerMapping() {
        Map<String, WebSocketHandler> map = new HashMap<>();
        map.put("/ws/vibrations", vibrationWebSocketHandler);
        map.put("/ws/alerts", alertWebSocketHandler);

        SimpleUrlHandlerMapping handlerMapping = new SimpleUrlHandlerMapping();
        handlerMapping.setOrder(-1); // High priority
        
        Map<String, org.springframework.web.cors.CorsConfiguration> corsMap = new HashMap<>();
        org.springframework.web.cors.CorsConfiguration corsConfig = new org.springframework.web.cors.CorsConfiguration();
        corsConfig.setAllowedOrigins(java.util.Arrays.asList("*"));
        corsConfig.setAllowedMethods(java.util.Arrays.asList("GET"));
        corsMap.put("/ws/**", corsConfig);
        
        handlerMapping.setUrlMap(map);
        handlerMapping.setCorsConfigurations(corsMap);
        return handlerMapping;
    }

    @Bean
    public WebSocketHandlerAdapter handlerAdapter() {
        return new WebSocketHandlerAdapter();
    }
}
