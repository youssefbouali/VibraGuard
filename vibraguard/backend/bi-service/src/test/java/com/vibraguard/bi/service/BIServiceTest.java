package com.vibraguard.bi.service;

import com.vibraguard.bi.entity.KpiValue;
import com.vibraguard.bi.entity.MotorEntity;
import com.vibraguard.bi.entity.WorkOrder;
import com.vibraguard.bi.repository.KpiValueRepository;
import com.vibraguard.bi.repository.MotorRepository;
import com.vibraguard.bi.repository.WorkOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BIServiceTest {

    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private MotorRepository motorRepository;
    @Mock private KpiValueRepository kpiValueRepository;

    private BIService biService;

    @BeforeEach
    void setUp() {
        biService = new BIService();
        ReflectionTestUtils.setField(biService, "workOrderRepository", workOrderRepository);
        ReflectionTestUtils.setField(biService, "motorRepository", motorRepository);
        ReflectionTestUtils.setField(biService, "kpiValueRepository", kpiValueRepository);
    }

    @Test
    void getInterventions_withMixedTypes_shouldGroupCounts() {
        WorkOrder preventive = new WorkOrder();
        preventive.setType("Pr\u00e9ventif");
        WorkOrder corrective = new WorkOrder();
        corrective.setType("Correctif");
        WorkOrder other = new WorkOrder();
        other.setType("Inspection");

        when(workOrderRepository.findAll()).thenReturn(List.of(preventive, corrective, corrective, other));

        List<Map<String, Object>> result = biService.getInterventions();

        assertEquals(3, result.size());
        Map<String, Object> prev = result.stream().filter(m -> "Pr\u00e9ventif".equals(m.get("type"))).findFirst().orElseThrow();
        assertEquals(1, prev.get("value"));
        assertEquals("#10B981", prev.get("color"));

        Map<String, Object> corr = result.stream().filter(m -> "Correctif".equals(m.get("type"))).findFirst().orElseThrow();
        assertEquals(2, corr.get("value"));
        assertEquals("#EF4444", corr.get("color"));
    }

    @Test
    void getInterventions_withEmptyList_shouldReturnEmpty() {
        when(workOrderRepository.findAll()).thenReturn(Collections.emptyList());
        assertTrue(biService.getInterventions().isEmpty());
    }

    @Test
    void calculateMTTR_withValidDurations_shouldCalculateCorrectly() {
        WorkOrder wo1 = new WorkOrder();
        wo1.setType("Correctif");
        wo1.setDuration("2h30m");

        WorkOrder wo2 = new WorkOrder();
        wo2.setType("Correctif");
        wo2.setDuration("1h15m");

        WorkOrder wo3 = new WorkOrder();
        wo3.setType("Pr\u00e9ventif");
        wo3.setDuration("3h");

        when(workOrderRepository.findAll()).thenReturn(List.of(wo1, wo2, wo3));

        double mttr = biService.calculateMTTR();
        assertEquals(1.9, mttr, 0.1);
    }

    @Test
    void calculateMTTR_withNoCorrectiveWorkOrders_shouldReturnZero() {
        WorkOrder wo = new WorkOrder();
        wo.setType("Pr\u00e9ventif");
        wo.setDuration("2h");

        when(workOrderRepository.findAll()).thenReturn(List.of(wo));

        assertEquals(0.0, biService.calculateMTTR(), 0.001);
    }

    @Test
    void calculateMTTR_withEmptyDurations_shouldHandleGracefully() {
        WorkOrder wo = new WorkOrder();
        wo.setType("Correctif");
        wo.setDuration("");

        when(workOrderRepository.findAll()).thenReturn(List.of(wo));

        assertEquals(0.0, biService.calculateMTTR(), 0.001);
    }

    @Test
    void getBIKPIs_shouldReturnAllKeys() {
        WorkOrder wo = new WorkOrder();
        wo.setType("Correctif");
        wo.setDuration("1h");
        wo.setCost(500.0);
        wo.setStatus("Termin\u00e9");

        when(workOrderRepository.findAll()).thenReturn(List.of(wo));
        when(motorRepository.findAll()).thenReturn(Collections.emptyList());

        Map<String, Object> kpis = biService.getBIKPIs();

        assertNotNull(kpis.get("totalMotors"));
        assertNotNull(kpis.get("criticalMotors"));
        assertNotNull(kpis.get("uptime"));
        assertNotNull(kpis.get("mtbf"));
        assertNotNull(kpis.get("mttr"));
        assertNotNull(kpis.get("maintenanceCost"));
        assertNotNull(kpis.get("activeWorkOrders"));
        assertEquals(1, kpis.get("correctiveCount"));
    }

    @Test
    void getMtbfBySite_withMultipleSites_shouldCalculateCorrectly() {
        MotorEntity motor1 = new MotorEntity();
        motor1.setId("M1");
        motor1.setSite("Site A");

        MotorEntity motor2 = new MotorEntity();
        motor2.setId("M2");
        motor2.setSite("Site B");

        WorkOrder wo1 = new WorkOrder();
        wo1.setType("Correctif");
        wo1.setAsset("M1");
        wo1.setDueDate("2024-01-01 10:00:00");

        WorkOrder wo2 = new WorkOrder();
        wo2.setType("Correctif");
        wo2.setAsset("M1");
        wo2.setDueDate("2024-01-10 10:00:00");

        WorkOrder wo3 = new WorkOrder();
        wo3.setType("Correctif");
        wo3.setAsset("M2");
        wo3.setDueDate("2024-01-05 10:00:00");

        when(motorRepository.findAll()).thenReturn(List.of(motor1, motor2));
        when(workOrderRepository.findAll()).thenReturn(List.of(wo1, wo2, wo3));

        List<Map<String, Object>> result = biService.getMtbfBySite();

        assertEquals(2, result.size());
        assertTrue(result.stream().anyMatch(r -> "Site A".equals(r.get("name"))));
        assertTrue(result.stream().anyMatch(r -> "Site B".equals(r.get("name"))));
    }
}
