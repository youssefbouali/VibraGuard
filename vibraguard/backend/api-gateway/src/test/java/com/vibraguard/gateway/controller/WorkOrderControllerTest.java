package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.auth.model.User;
import com.vibraguard.gateway.auth.repository.UserRepository;
import com.vibraguard.gateway.entity.Alert;
import com.vibraguard.gateway.entity.WorkOrder;
import com.vibraguard.gateway.repository.AlertRepository;
import com.vibraguard.gateway.repository.WorkOrderRepository;
import com.vibraguard.gateway.util.ControllerUtils;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class WorkOrderControllerTest {

    @Test
    void getWorkOrdersFiltersForTechnician() {
        WorkOrderRepository workOrderRepository = mock(WorkOrderRepository.class);
        AlertRepository alertRepository = mock(AlertRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        ControllerUtils utils = mock(ControllerUtils.class);

        WorkOrderController controller = new WorkOrderController();
        ReflectionTestUtils.setField(controller, "workOrderRepository", workOrderRepository);
        ReflectionTestUtils.setField(controller, "alertRepository", alertRepository);
        ReflectionTestUtils.setField(controller, "userRepository", userRepository);
        ReflectionTestUtils.setField(controller, "utils", utils);

        Principal principal = () -> "tech@b.com";
        when(utils.isTechnician(principal)).thenReturn(true);
        when(utils.currentUser(principal)).thenReturn(Optional.of(User.builder().fullName("Tech One").build()));

        WorkOrder o1 = new WorkOrder();
        o1.setId("W1");
        o1.setAssignedTo("Tech One");
        WorkOrder o2 = new WorkOrder();
        o2.setId("W2");
        o2.setAssignedTo("Other");

        when(workOrderRepository.findAll()).thenReturn(List.of(o1, o2));

        List<WorkOrder> res = controller.getWorkOrders(principal).collectList().block();
        assertNotNull(res);
        assertEquals(1, res.size());
        assertEquals("W1", res.get(0).getId());
    }

    @Test
    void createWorkOrderAssignsIdAndCreatedAtAndTechnicianName() {
        WorkOrderRepository workOrderRepository = mock(WorkOrderRepository.class);
        AlertRepository alertRepository = mock(AlertRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        ControllerUtils utils = mock(ControllerUtils.class);

        WorkOrderController controller = new WorkOrderController();
        ReflectionTestUtils.setField(controller, "workOrderRepository", workOrderRepository);
        ReflectionTestUtils.setField(controller, "alertRepository", alertRepository);
        ReflectionTestUtils.setField(controller, "userRepository", userRepository);
        ReflectionTestUtils.setField(controller, "utils", utils);

        Principal principal = () -> "tech@b.com";
        when(utils.isTechnician(principal)).thenReturn(true);
        when(utils.isAdmin(principal)).thenReturn(false);
        when(utils.currentUser(principal)).thenReturn(Optional.of(User.builder().fullName("Tech One").build()));

        when(workOrderRepository.count()).thenReturn(0L);
        when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(inv -> inv.getArgument(0));

        WorkOrder wo = new WorkOrder();
        wo.setTitle("T");
        WorkOrder saved = controller.createWorkOrder(wo, principal).block();

        assertNotNull(saved);
        assertNotNull(saved.getId());
        assertNotNull(saved.getCreatedAt());
        assertEquals("Tech One", saved.getAssignedTo());
        verify(alertRepository, never()).save(any(Alert.class));
    }

    @Test
    void updateWorkOrderSetsCompletedAtAndHonorsAdminAssignment() {
        WorkOrderRepository workOrderRepository = mock(WorkOrderRepository.class);
        AlertRepository alertRepository = mock(AlertRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        ControllerUtils utils = mock(ControllerUtils.class);

        WorkOrderController controller = new WorkOrderController();
        ReflectionTestUtils.setField(controller, "workOrderRepository", workOrderRepository);
        ReflectionTestUtils.setField(controller, "alertRepository", alertRepository);
        ReflectionTestUtils.setField(controller, "userRepository", userRepository);
        ReflectionTestUtils.setField(controller, "utils", utils);

        Principal principal = () -> "admin@b.com";
        when(utils.isAdmin(principal)).thenReturn(true);
        when(utils.isTechnician(principal)).thenReturn(false);

        WorkOrder existing = new WorkOrder();
        existing.setId("W1");
        existing.setStatus("En cours");
        when(workOrderRepository.findById("W1")).thenReturn(Optional.of(existing));
        when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(inv -> inv.getArgument(0));

        WorkOrder patch = new WorkOrder();
        patch.setTitle("New");
        patch.setAsset("M1");
        patch.setStatus("Terminé");
        patch.setPriority("High");
        patch.setAssignedTo("Tech One");

        WorkOrder updated = controller.updateWorkOrder("W1", patch, principal).block();
        assertNotNull(updated);
        assertEquals("Terminé", updated.getStatus());
        assertNotNull(updated.getCompletedAt());
        assertEquals("Tech One", updated.getAssignedTo());
    }

    @Test
    void createWorkOrderAsAdminCreatesNotificationForAssignedTechnician() {
        WorkOrderRepository workOrderRepository = mock(WorkOrderRepository.class);
        AlertRepository alertRepository = mock(AlertRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        ControllerUtils utils = mock(ControllerUtils.class);

        WorkOrderController controller = new WorkOrderController();
        ReflectionTestUtils.setField(controller, "workOrderRepository", workOrderRepository);
        ReflectionTestUtils.setField(controller, "alertRepository", alertRepository);
        ReflectionTestUtils.setField(controller, "userRepository", userRepository);
        ReflectionTestUtils.setField(controller, "utils", utils);

        Principal principal = () -> "admin@b.com";
        when(utils.isAdmin(principal)).thenReturn(true);
        when(utils.isTechnician(principal)).thenReturn(false);
        when(utils.currentUser(principal)).thenReturn(Optional.of(User.builder().email("admin@b.com").fullName("Admin").build()));

        when(userRepository.findAll()).thenReturn(List.of(
                User.builder().email("tech@b.com").fullName("Tech One").build()
        ));

        when(workOrderRepository.count()).thenReturn(0L);
        when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(inv -> inv.getArgument(0));

        WorkOrder wo = new WorkOrder();
        wo.setAssignedTo("Tech One");
        wo.setTitle("Fix");
        wo.setAsset("M1");

        controller.createWorkOrder(wo, principal).block();
        verify(alertRepository).save(any(Alert.class));
    }
}

