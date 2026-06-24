package com.vibraguard.motor.service;

import com.vibraguard.motor.entity.VibrationData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.time.Duration;

class VibrationStreamServiceTest {

    private VibrationStreamService vibrationStreamService;

    @BeforeEach
    void setUp() {
        vibrationStreamService = new VibrationStreamService();
    }

    @Test
    void emit_shouldPushDataToStream() {
        VibrationData data = new VibrationData();
        data.setId("VIB-001");
        data.setVibRms(0.75);

        Flux<String> stream = vibrationStreamService.getVibrationStream();
        StepVerifier.create(stream)
                .then(() -> vibrationStreamService.emit(data))
                .expectNextMatches(json -> json.contains("VIB-001") && json.contains("0.75"))
                .thenCancel()
                .verify(Duration.ofSeconds(5));
    }

    @Test
    void emit_multipleDataPoints_shouldPushInOrder() {
        VibrationData data1 = new VibrationData();
        data1.setId("VIB-001");
        data1.setVibRms(0.5);

        VibrationData data2 = new VibrationData();
        data2.setId("VIB-002");
        data2.setVibRms(0.9);

        Flux<String> stream = vibrationStreamService.getVibrationStream();
        StepVerifier.create(stream)
                .then(() -> {
                    vibrationStreamService.emit(data1);
                    vibrationStreamService.emit(data2);
                })
                .expectNextMatches(json -> json.contains("VIB-001"))
                .expectNextMatches(json -> json.contains("VIB-002"))
                .thenCancel()
                .verify(Duration.ofSeconds(5));
    }

    @Test
    void emit_withNullData_shouldNotPushToStream() {
        Flux<String> stream = vibrationStreamService.getVibrationStream();
        StepVerifier.create(stream)
                .then(() -> vibrationStreamService.emit(null))
                .expectNextCount(0)
                .thenCancel()
                .verify(Duration.ofSeconds(5));
    }
}
