package com.vibraguard.bi.controller;

import com.vibraguard.bi.entity.KpiValue;
import com.vibraguard.bi.repository.KpiValueRepository;
import com.vibraguard.bi.repository.MaintenanceCostRepository;
import com.vibraguard.bi.service.BIService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BIControllerTest {

    @Mock private MaintenanceCostRepository maintenanceCostRepository;
    @Mock private KpiValueRepository kpiValueRepository;
    @Mock private BIService biService;

    private BIController controller;

    @BeforeEach
    void setUp() {
        controller = new BIController();
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "maintenanceCostRepository", maintenanceCostRepository);
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "kpiValueRepository", kpiValueRepository);
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "biService", biService);
    }

    @Test
    void getBIKPIs_shouldDelegateToService() {
        Map<String, Object> expected = Map.of("totalMotors", 10);
        when(biService.getBIKPIs()).thenReturn(expected);

        Map<String, Object> result = controller.getBIKPIs();

        assertEquals(10, result.get("totalMotors"));
    }

    @Test
    void upsertKPI_whenExists_shouldUpdate() {
        KpiValue existing = new KpiValue();
        existing.setId("uptime");
        existing.setNumericValue(95.0);

        KpiValue update = new KpiValue();
        update.setId("uptime");
        update.setNumericValue(98.0);

        when(kpiValueRepository.findById("uptime")).thenReturn(Optional.of(existing));
        when(kpiValueRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        KpiValue result = controller.upsertKPI(update);
        assertEquals(98.0, result.getNumericValue());
    }

    @Test
    void upsertKPI_whenNotFound_shouldCreate() {
        KpiValue kpi = new KpiValue();
        kpi.setId("new-kpi");
        kpi.setNumericValue(50.0);

        when(kpiValueRepository.findById("new-kpi")).thenReturn(Optional.empty());
        when(kpiValueRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        KpiValue result = controller.upsertKPI(kpi);
        assertEquals(50.0, result.getNumericValue());
    }

    @Test
    void getMaintenanceCosts_shouldReturnAll() {
        when(maintenanceCostRepository.findAll()).thenReturn(List.of());
        assertTrue(controller.getMaintenanceCosts().isEmpty());
    }

    @Test
    void getInterventions_shouldDelegateToService() {
        List<Map<String, Object>> expected = List.of(Map.of("type", "Correctif", "value", 5));
        when(biService.getInterventions()).thenReturn(expected);

        List<Map<String, Object>> result = controller.getInterventions();
        assertEquals(1, result.size());
        assertEquals("Correctif", result.get(0).get("type"));
    }

    @Test
    void getMtbfBySite_shouldDelegateToService() {
        List<Map<String, Object>> expected = List.of(Map.of("name", "Site A", "value", 100.0));
        when(biService.getMtbfBySite()).thenReturn(expected);

        List<Map<String, Object>> result = controller.getMtbfBySite();
        assertEquals(1, result.size());
    }

    @Test
    void getBIReports_shouldReturnEmptyList() {
        assertTrue(controller.getBIReports().isEmpty());
    }
}
