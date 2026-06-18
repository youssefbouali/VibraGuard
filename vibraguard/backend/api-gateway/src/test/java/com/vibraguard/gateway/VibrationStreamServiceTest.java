package com.vibraguard.gateway;

import com.vibraguard.gateway.entity.VibrationData;
import org.junit.jupiter.api.Test;
import reactor.test.StepVerifier;

class VibrationStreamServiceTest {

    @Test
    void emitsSerializedVibrations() {
        VibrationStreamService service = new VibrationStreamService();

        StepVerifier.create(service.getVibrationStream().take(1))
                .then(() -> {
                    VibrationData data = new VibrationData();
                    data.setMotorId("M1");
                    data.setVibRms(1.23);
                    service.emit(data);
                })
                .expectNextMatches(json -> json.contains("\"motorId\":\"M1\""))
                .verifyComplete();
    }
}

