package com.vibraguard.motor.service;

import com.vibraguard.motor.entity.VibrationData;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@Service
public class VibrationStreamService {

    private final Sinks.Many<String> vibrationSink = Sinks.many().multicast().directBestEffort();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void emit(VibrationData data) {
        try {
            String json = objectMapper.writeValueAsString(data);
            vibrationSink.tryEmitNext(json);
        } catch (Exception e) {
            System.err.println("Error serializing vibration data: " + e.getMessage());
        }
    }

    public Flux<String> getVibrationStream() {
        return vibrationSink.asFlux();
    }
}
