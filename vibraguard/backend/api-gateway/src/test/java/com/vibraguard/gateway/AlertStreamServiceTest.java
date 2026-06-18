package com.vibraguard.gateway;

import com.vibraguard.gateway.entity.Alert;
import org.junit.jupiter.api.Test;
import reactor.test.StepVerifier;

class AlertStreamServiceTest {

    @Test
    void emitsSerializedAlerts() {
        AlertStreamService service = new AlertStreamService();

        StepVerifier.create(service.getAlertStream().take(1))
                .then(() -> {
                    Alert alert = new Alert();
                    alert.setId("ALR-1");
                    alert.setMessage("m");
                    service.emit(alert);
                })
                .expectNextMatches(json -> json.contains("\"id\":\"ALR-1\""))
                .verifyComplete();
    }
}

