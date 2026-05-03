package com.vibraguard.gateway;

import com.vibraguard.gateway.entity.Alert;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@Service
public class AlertStreamService {

    private final Sinks.Many<String> alertSink = Sinks.many().multicast().directBestEffort();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void emit(Alert alert) {
        try {
            String json = objectMapper.writeValueAsString(alert);
            alertSink.tryEmitNext(json);
        } catch (Exception e) {
            System.err.println("Error serializing alert data: " + e.getMessage());
        }
    }

    public Flux<String> getAlertStream() {
        return alertSink.asFlux();
    }
}
