package com.vibraguard.alert.service;

import com.vibraguard.alert.entity.Alert;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.time.Duration;

class AlertStreamServiceTest {

    private AlertStreamService alertStreamService;

    @BeforeEach
    void setUp() {
        alertStreamService = new AlertStreamService();
    }

    @Test
    void emit_shouldPushAlertToStream() {
        Alert alert = new Alert();
        alert.setId("ALR-001");
        alert.setTitle("Test Alert");
        alert.setLevel("HIGH");

        Flux<String> stream = alertStreamService.getAlertStream();
        StepVerifier.create(stream)
                .then(() -> alertStreamService.emit(alert))
                .expectNextMatches(json -> json.contains("ALR-001") && json.contains("Test Alert"))
                .thenCancel()
                .verify(Duration.ofSeconds(5));
    }

    @Test
    void emit_multipleAlerts_shouldPushInOrder() {
        Alert alert1 = new Alert();
        alert1.setId("ALR-001");
        alert1.setTitle("First");

        Alert alert2 = new Alert();
        alert2.setId("ALR-002");
        alert2.setTitle("Second");

        Flux<String> stream = alertStreamService.getAlertStream();
        StepVerifier.create(stream)
                .then(() -> {
                    alertStreamService.emit(alert1);
                    alertStreamService.emit(alert2);
                })
                .expectNextMatches(json -> json.contains("ALR-001"))
                .expectNextMatches(json -> json.contains("ALR-002"))
                .thenCancel()
                .verify(Duration.ofSeconds(5));
    }

    @Test
    void getAlertStream_shouldReturnHotStream() {
        Flux<String> stream = alertStreamService.getAlertStream();
        StepVerifier.create(stream)
                .expectNextCount(0)
                .thenCancel()
                .verify(Duration.ofSeconds(5));
    }
}
