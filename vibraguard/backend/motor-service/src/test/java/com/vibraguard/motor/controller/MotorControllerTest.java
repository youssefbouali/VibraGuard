package com.vibraguard.motor.controller;

import com.vibraguard.motor.entity.Motor;
import com.vibraguard.motor.entity.VibrationData;
import com.vibraguard.motor.repository.MotorRepository;
import com.vibraguard.motor.repository.VibrationRepository;
import com.vibraguard.motor.repository.VibrationSearchRepository;
import com.vibraguard.motor.service.VibrationStreamService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MotorControllerTest {

    @Mock private MotorRepository motorRepository;
    @Mock private VibrationRepository vibrationRepository;
    @Mock private VibrationSearchRepository vibrationSearchRepository;
    @Mock private VibrationStreamService vibrationStreamService;

    private MotorController controller;

    @BeforeEach
    void setUp() {
        controller = new MotorController();
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "motorRepository", motorRepository);
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "vibrationRepository", vibrationRepository);
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "vibrationSearchRepository", vibrationSearchRepository);
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "vibrationStreamService", vibrationStreamService);
    }

    @Test
    void createMotor_shouldSetDefaults() {
        Motor input = new Motor();
        input.setType("Asynchrone");
        when(motorRepository.count()).thenReturn(5L);
        when(motorRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Mono<Motor> result = controller.createMotor(input);
        StepVerifier.create(result)
                .expectNextMatches(m -> m.getId().equals("MTR-15")
                        && m.getEtatPct() == 100
                        && m.getEtatLabel().equals("100% Normal")
                        && m.getActif() == true)
                .verifyComplete();
    }

    @Test
    void createMotor_withExistingId_shouldPreserveId() {
        Motor input = new Motor();
        input.setId("MTR-CUSTOM");
        when(motorRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        StepVerifier.create(controller.createMotor(input))
                .expectNextMatches(m -> m.getId().equals("MTR-CUSTOM"))
                .verifyComplete();
    }

    @Test
    void getMotors_shouldReturnListWithHealthData() {
        Motor motor = new Motor();
        motor.setId("MTR-001");
        motor.setType("Asynchrone");
        motor.setSite("Site A");
        motor.setActif(true);
        when(motorRepository.findAll()).thenReturn(List.of(motor));

        VibrationData vib = new VibrationData();
        vib.setAnomalous(false);
        when(vibrationRepository.findByMotorId("MTR-001")).thenReturn(List.of(vib));

        Flux<java.util.Map<String, Object>> result = controller.getMotors();
        StepVerifier.create(result)
                .expectNextMatches(m -> m.get("id").equals("MTR-001")
                        && m.get("zone").equals("Site A"))
                .verifyComplete();
    }

    @Test
    void getMotorById_whenExists_shouldReturnMotorWithHealth() {
        Motor motor = new Motor();
        motor.setId("MTR-001");
        motor.setType("Asynchrone");
        when(motorRepository.findById("MTR-001")).thenReturn(Optional.of(motor));
        when(vibrationRepository.findByMotorId("MTR-001")).thenReturn(List.of());

        StepVerifier.create(controller.getMotorById("MTR-001"))
                .expectNextMatches(m -> m.getEtatPct() == 100 && m.getVibrationColor().equals("#10B981"))
                .verifyComplete();
    }

    @Test
    void getMotorById_whenNotFound_shouldThrow() {
        when(motorRepository.findById("MTR-999")).thenReturn(Optional.empty());

        StepVerifier.create(controller.getMotorById("MTR-999"))
                .expectError(ResponseStatusException.class)
                .verify();
    }

    @Test
    void deleteMotor_shouldDeleteVibrationsThenMotor() {
        StepVerifier.create(controller.deleteMotor("MTR-001")).verifyComplete();
        verify(vibrationRepository).deleteByMotorId("MTR-001");
        verify(motorRepository).deleteById("MTR-001");
    }

    @Test
    void updateMotor_whenExists_shouldUpdateFields() {
        Motor existing = new Motor();
        existing.setId("MTR-001");
        existing.setType("Asynchrone");
        Motor update = new Motor();
        update.setType("Synchrone");
        update.setSite("Site B");

        when(motorRepository.findById("MTR-001")).thenReturn(Optional.of(existing));
        when(motorRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        StepVerifier.create(controller.updateMotor("MTR-001", update))
                .expectNextMatches(m -> m.getType().equals("Synchrone")
                        && m.getSite().equals("Site B"))
                .verifyComplete();
    }

    @Test
    void getVibration_shouldReturnList() {
        VibrationData vib = new VibrationData();
        vib.setId("VIB-001");
        when(vibrationRepository.findByMotorId("MTR-001")).thenReturn(List.of(vib));

        Mono<List<VibrationData>> result = controller.getVibration("MTR-001");
        StepVerifier.create(result)
                .expectNextMatches(list -> list.size() == 1 && list.get(0).getId().equals("VIB-001"))
                .verifyComplete();
    }

    @Test
    void saveVibration_shouldSetTimeAndSync() {
        VibrationData vib = new VibrationData();
        vib.setId("VIB-001");
        vib.setMotorId("MTR-001");
        vib.setVibRms(0.75);
        vib.setAnomalous(false);

        when(vibrationRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(vibrationSearchRepository.save(any())).thenReturn(null);

        StepVerifier.create(controller.saveVibration(vib))
                .expectNextMatches(v -> v.getId().equals("VIB-001")
                        && v.getTime() != null)
                .verifyComplete();

        verify(vibrationStreamService).emit(vib);
    }

    @Test
    void getAllVibrations_shouldReturnAll() {
        VibrationData vib = new VibrationData();
        vib.setId("VIB-001");
        when(vibrationRepository.findAll()).thenReturn(List.of(vib));

        StepVerifier.create(controller.getAllVibrations())
                .expectNextMatches(list -> list.size() == 1)
                .verifyComplete();
    }
}
