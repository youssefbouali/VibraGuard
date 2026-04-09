package com.vibraguard.gateway;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@Service
public class VibrationStreamService {

    private final Sinks.Many<String> vibrationSink = Sinks.many().multicast().directBestEffort();

    @KafkaListener(topics = "vibration_data", groupId = "vibraguard-gateway-group")
    public void consume(String message) {
        vibrationSink.tryEmitNext(message);
    }

    public Flux<String> getVibrationStream() {
        return vibrationSink.asFlux();
    }
}
