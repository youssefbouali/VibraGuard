package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.VibrationStreamService;
import com.vibraguard.gateway.entity.Alert;
import com.vibraguard.gateway.entity.Motor;
import com.vibraguard.gateway.entity.VibrationData;
import com.vibraguard.gateway.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MotorControllerTest {

    @Test
    void createMotorAssignsDefaultsWhenMissing() {
        MotorRepository motorRepository = mock(MotorRepository.class);
        AlertRepository alertRepository = mock(AlertRepository.class);
        VibrationRepository vibrationRepository = mock(VibrationRepository.class);
        VibrationSearchRepository vibrationSearchRepository = mock(VibrationSearchRepository.class);
        VibrationStreamService vibrationStreamService = mock(VibrationStreamService.class);

        MotorController controller = new MotorController();
        ReflectionTestUtils.setField(controller, "motorRepository", motorRepository);
        ReflectionTestUtils.setField(controller, "alertRepository", alertRepository);
        ReflectionTestUtils.setField(controller, "vibrationRepository", vibrationRepository);
        ReflectionTestUtils.setField(controller, "vibrationSearchRepository", vibrationSearchRepository);
        ReflectionTestUtils.setField(controller, "vibrationStreamService", vibrationStreamService);

        when(motorRepository.count()).thenReturn(0L);
        when(motorRepository.save(any(Motor.class))).thenAnswer(inv -> inv.getArgument(0));

        Motor m = new Motor();
        Motor saved = controller.createMotor(m).block();

        assertNotNull(saved);
        assertEquals("MTR-10", saved.getId());
        assertEquals(100, saved.getEtatPct());
        assertEquals("100% Normal", saved.getEtatLabel());
        assertEquals("#10B981", saved.getEtatColor());
        assertEquals("0.00", saved.getVibration());
        assertEquals("#10B981", saved.getVibrationColor());
    }

    @Test
    void updateMotorUpdatesExistingOrCreatesNew() {
        MotorRepository motorRepository = mock(MotorRepository.class);
        AlertRepository alertRepository = mock(AlertRepository.class);
        VibrationRepository vibrationRepository = mock(VibrationRepository.class);
        VibrationSearchRepository vibrationSearchRepository = mock(VibrationSearchRepository.class);
        VibrationStreamService vibrationStreamService = mock(VibrationStreamService.class);

        MotorController controller = new MotorController();
        ReflectionTestUtils.setField(controller, "motorRepository", motorRepository);
        ReflectionTestUtils.setField(controller, "alertRepository", alertRepository);
        ReflectionTestUtils.setField(controller, "vibrationRepository", vibrationRepository);
        ReflectionTestUtils.setField(controller, "vibrationSearchRepository", vibrationSearchRepository);
        ReflectionTestUtils.setField(controller, "vibrationStreamService", vibrationStreamService);

        Motor existing = new Motor();
        existing.setId("M1");
        existing.setType("old");

        when(motorRepository.findById("M1")).thenReturn(Optional.of(existing));
        when(motorRepository.save(any(Motor.class))).thenAnswer(inv -> inv.getArgument(0));

        Motor patch = new Motor();
        patch.setType("new");
        patch.setEtatPct(50);
        Motor updated = controller.updateMotor("M1", patch).block();

        assertNotNull(updated);
        assertEquals("new", updated.getType());
        assertEquals(50, updated.getEtatPct());

        when(motorRepository.findById("M2")).thenReturn(Optional.empty());
        Motor created = controller.updateMotor("M2", new Motor()).block();
        assertNotNull(created);
        assertEquals("M2", created.getId());
    }

    @Test
    void deleteMotorDeletesRelatedData() {
        MotorRepository motorRepository = mock(MotorRepository.class);
        AlertRepository alertRepository = mock(AlertRepository.class);
        VibrationRepository vibrationRepository = mock(VibrationRepository.class);
        VibrationSearchRepository vibrationSearchRepository = mock(VibrationSearchRepository.class);
        VibrationStreamService vibrationStreamService = mock(VibrationStreamService.class);

        MotorController controller = new MotorController();
        ReflectionTestUtils.setField(controller, "motorRepository", motorRepository);
        ReflectionTestUtils.setField(controller, "alertRepository", alertRepository);
        ReflectionTestUtils.setField(controller, "vibrationRepository", vibrationRepository);
        ReflectionTestUtils.setField(controller, "vibrationSearchRepository", vibrationSearchRepository);
        ReflectionTestUtils.setField(controller, "vibrationStreamService", vibrationStreamService);

        controller.deleteMotor("M1").block();
        verify(vibrationRepository).deleteByMotorId("M1");
        verify(alertRepository).deleteByMotorId("M1");
        verify(motorRepository).deleteById("M1");
    }

    @Test
    void getMotorsComputesHealthAndVibrationColor() {
        MotorRepository motorRepository = mock(MotorRepository.class);
        AlertRepository alertRepository = mock(AlertRepository.class);
        VibrationRepository vibrationRepository = mock(VibrationRepository.class);
        VibrationSearchRepository vibrationSearchRepository = mock(VibrationSearchRepository.class);
        VibrationStreamService vibrationStreamService = mock(VibrationStreamService.class);

        MotorController controller = new MotorController();
        ReflectionTestUtils.setField(controller, "motorRepository", motorRepository);
        ReflectionTestUtils.setField(controller, "alertRepository", alertRepository);
        ReflectionTestUtils.setField(controller, "vibrationRepository", vibrationRepository);
        ReflectionTestUtils.setField(controller, "vibrationSearchRepository", vibrationSearchRepository);
        ReflectionTestUtils.setField(controller, "vibrationStreamService", vibrationStreamService);

        Motor m = new Motor();
        m.setId("M1");
        m.setSite("Site A");
        when(motorRepository.findAll()).thenReturn(List.of(m));
        when(alertRepository.findAll()).thenReturn(List.of(new Alert()));

        VibrationData v1 = new VibrationData();
        v1.setMotorId("M1");
        v1.setAnomalous(true);
        VibrationData v2 = new VibrationData();
        v2.setMotorId("M1");
        v2.setAnomalous(false);
        when(vibrationRepository.findByMotorId("M1")).thenReturn(List.of(v1, v2));

        List<Map<String, Object>> res = controller.getMotors().collectList().block();
        assertNotNull(res);
        assertEquals(1, res.size());
        assertEquals("M1", res.get(0).get("id"));
        assertEquals(50, res.get(0).get("etatPct"));
        assertEquals("#10B981", res.get(0).get("vibrationColor"));
    }

    @Test
    void saveVibrationSetsTimeAndEmitsEvenWhenElasticSyncFails() {
        MotorRepository motorRepository = mock(MotorRepository.class);
        AlertRepository alertRepository = mock(AlertRepository.class);
        VibrationRepository vibrationRepository = mock(VibrationRepository.class);
        VibrationSearchRepository vibrationSearchRepository = mock(VibrationSearchRepository.class);
        VibrationStreamService vibrationStreamService = mock(VibrationStreamService.class);

        MotorController controller = new MotorController();
        ReflectionTestUtils.setField(controller, "motorRepository", motorRepository);
        ReflectionTestUtils.setField(controller, "alertRepository", alertRepository);
        ReflectionTestUtils.setField(controller, "vibrationRepository", vibrationRepository);
        ReflectionTestUtils.setField(controller, "vibrationSearchRepository", vibrationSearchRepository);
        ReflectionTestUtils.setField(controller, "vibrationStreamService", vibrationStreamService);

        VibrationData vib = new VibrationData();
        vib.setId("V1");
        vib.setMotorId("M1");
        vib.setVibRms(1.0);

        when(vibrationRepository.save(any(VibrationData.class))).thenAnswer(inv -> inv.getArgument(0));
        doThrow(new RuntimeException("es down")).when(vibrationSearchRepository).save(any());

        VibrationData saved = controller.saveVibration(vib).block();
        assertNotNull(saved);
        assertNotNull(saved.getTime());
        verify(vibrationStreamService).emit(any(VibrationData.class));
    }
}

