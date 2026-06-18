package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.entity.*;
import com.vibraguard.gateway.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BIControllerTest {

    @Test
    void computesBikpisFromRepositories() {
        WorkOrderRepository workOrderRepository = mock(WorkOrderRepository.class);
        AlertRepository alertRepository = mock(AlertRepository.class);
        SiteMtbfRepository siteMtbfRepository = mock(SiteMtbfRepository.class);
        MaintenanceCostRepository maintenanceCostRepository = mock(MaintenanceCostRepository.class);
        InterventionRepository interventionRepository = mock(InterventionRepository.class);
        KpiValueRepository kpiValueRepository = mock(KpiValueRepository.class);
        MotorRepository motorRepository = mock(MotorRepository.class);
        VibrationRepository vibrationRepository = mock(VibrationRepository.class);

        BIController controller = new BIController();
        ReflectionTestUtils.setField(controller, "workOrderRepository", workOrderRepository);
        ReflectionTestUtils.setField(controller, "alertRepository", alertRepository);
        ReflectionTestUtils.setField(controller, "siteMtbfRepository", siteMtbfRepository);
        ReflectionTestUtils.setField(controller, "maintenanceCostRepository", maintenanceCostRepository);
        ReflectionTestUtils.setField(controller, "interventionRepository", interventionRepository);
        ReflectionTestUtils.setField(controller, "kpiValueRepository", kpiValueRepository);
        ReflectionTestUtils.setField(controller, "motorRepository", motorRepository);
        ReflectionTestUtils.setField(controller, "vibrationRepository", vibrationRepository);

        Motor m1 = new Motor();
        m1.setEtatLabel("45% Critique");
        m1.setSite("Site1");
        Motor m2 = new Motor();
        m2.setEtatLabel("90% Normal");
        m2.setSite(" Site1 ");
        Motor m3 = new Motor();
        m3.setEtatLabel("95% Normal");
        m3.setSite("Site2");

        when(motorRepository.findAll()).thenReturn(List.of(m1, m2, m3));

        Alert a1 = new Alert();
        a1.setStatus("Nouveau");
        Alert a2 = new Alert();
        a2.setStatus("Acquittée");
        when(alertRepository.findAll()).thenReturn(List.of(a1, a2));

        VibrationData v1 = new VibrationData();
        v1.setAnomalous(false);
        VibrationData v2 = new VibrationData();
        v2.setAnomalous(true);
        VibrationData v3 = new VibrationData();
        v3.setAnomalous(false);
        VibrationData v4 = new VibrationData();
        v4.setAnomalous(false);
        when(vibrationRepository.findTop1000ByOrderByTimeDesc()).thenReturn(List.of(v1, v2, v3, v4));

        WorkOrder wo1 = new WorkOrder();
        wo1.setCost(10.0);
        wo1.setStatus("En cours");
        wo1.setCreatedAt("2026-01-01 00:00:00");
        wo1.setCompletedAt("2026-01-01 01:00:00");
        wo1.setDuration("1h 00m");

        WorkOrder wo2 = new WorkOrder();
        wo2.setCost(20.0);
        wo2.setStatus("Terminé");
        wo2.setCreatedAt("2026-01-02 00:00:00");
        wo2.setCompletedAt("2026-01-02 02:00:00");
        wo2.setDuration("2h");

        when(workOrderRepository.findAll()).thenReturn(List.of(wo1, wo2));

        Map<String, Object> kpis = controller.getBIKPIs().block();
        assertNotNull(kpis);
        assertEquals(3L, kpis.get("totalMotors"));
        assertEquals(1L, kpis.get("criticalMotors"));
        assertEquals(2L, kpis.get("alerts"));
        assertEquals(2L, kpis.get("sitesConnected"));
        assertTrue(String.valueOf(kpis.get("uptime")).contains("%"));
        assertEquals(30.0, (double) kpis.get("totalCost"), 0.001);
        assertTrue((double) kpis.get("mttr") > 0.0);
    }

    @Test
    void upsertUpdatesExistingOrSavesNew() {
        KpiValueRepository kpiValueRepository = mock(KpiValueRepository.class);

        BIController controller = new BIController();
        ReflectionTestUtils.setField(controller, "kpiValueRepository", kpiValueRepository);

        KpiValue existing = new KpiValue("k1", 1.0, "s", "t", true);
        when(kpiValueRepository.findById("k1")).thenReturn(Optional.of(existing));
        when(kpiValueRepository.save(any(KpiValue.class))).thenAnswer(inv -> inv.getArgument(0));

        KpiValue patch = new KpiValue("k1", 2.0, null, null, null);
        KpiValue updated = controller.upsertKPI(patch).block();
        assertNotNull(updated);
        assertEquals(2.0, updated.getNumericValue());

        when(kpiValueRepository.findById("k2")).thenReturn(Optional.empty());
        KpiValue created = controller.upsertKPI(new KpiValue("k2", 1.0, null, null, null)).block();
        assertNotNull(created);
        assertEquals("k2", created.getId());
    }
}

