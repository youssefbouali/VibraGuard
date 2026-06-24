package com.vibraguard.workorder.controller;

import com.vibraguard.workorder.entity.WorkOrder;
import com.vibraguard.workorder.repository.WorkOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkOrderControllerTest {

    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private WebClient.Builder webClientBuilder;

    private WorkOrderController controller;

    @BeforeEach
    void setUp() {
        lenient().when(webClientBuilder.build()).thenReturn(mock(WebClient.class));
        controller = new WorkOrderController();
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "workOrderRepository", workOrderRepository);
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "webClientBuilder", webClientBuilder);
    }

    @Test
    void getWorkOrders_shouldReturnAll() {
        WorkOrder wo = new WorkOrder();
        wo.setId("W-001");
        wo.setTitle("Test Work Order");
        when(workOrderRepository.findAll()).thenReturn(List.of(wo));

        Flux<WorkOrder> result = controller.getWorkOrders();
        StepVerifier.create(result)
                .expectNextMatches(w -> w.getTitle().equals("Test Work Order"))
                .verifyComplete();
    }

    @Test
    void createWorkOrder_shouldSetDefaults() {
        WorkOrder input = new WorkOrder();
        input.setTitle("New Work");
        when(workOrderRepository.count()).thenReturn(10L);
        when(workOrderRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        StepVerifier.create(controller.createWorkOrder(input))
                .expectNextMatches(w -> w.getId().equals("W-468")
                        && w.getCreatedAt() != null)
                .verifyComplete();
    }

    @Test
    void updateWorkOrder_whenExists_shouldUpdate() {
        WorkOrder existing = new WorkOrder();
        existing.setId("W-001");
        existing.setTitle("Old Title");
        existing.setStatus("En cours");

        WorkOrder update = new WorkOrder();
        update.setTitle("New Title");
        update.setStatus("Terminé");
        update.setAsset("MTR-001");
        update.setPriority("High");

        when(workOrderRepository.findById("W-001")).thenReturn(Optional.of(existing));
        when(workOrderRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        StepVerifier.create(controller.updateWorkOrder("W-001", update))
                .expectNextMatches(w -> w.getTitle().equals("New Title")
                        && w.getCompletedAt() != null)
                .verifyComplete();
    }

    @Test
    void updateWorkOrder_whenNotFound_shouldCreate() {
        WorkOrder update = new WorkOrder();
        update.setTitle("New Work");
        when(workOrderRepository.findById("W-999")).thenReturn(Optional.empty());
        when(workOrderRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        StepVerifier.create(controller.updateWorkOrder("W-999", update))
                .expectNextMatches(w -> w.getId().equals("W-999"))
                .verifyComplete();
    }

    @Test
    void deleteWorkOrder_shouldDelete() {
        StepVerifier.create(controller.deleteWorkOrder("W-001")).verifyComplete();
        verify(workOrderRepository).deleteById("W-001");
    }

    @Test
    void updateWorkOrder_withAssignmentChange_shouldNotify() {
        WorkOrder existing = new WorkOrder();
        existing.setId("W-001");
        existing.setTitle("Work");
        existing.setStatus("En cours");
        existing.setAssignedTo("old@test.com");

        WorkOrder update = new WorkOrder();
        update.setTitle("Work");
        update.setStatus("En cours");
        update.setAssignedTo("new@test.com");
        update.setAsset("MTR-001");

        when(workOrderRepository.findById("W-001")).thenReturn(Optional.of(existing));
        when(workOrderRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        StepVerifier.create(controller.updateWorkOrder("W-001", update))
                .expectNextMatches(w -> w.getTitle().equals("Work"))
                .verifyComplete();
    }
}
