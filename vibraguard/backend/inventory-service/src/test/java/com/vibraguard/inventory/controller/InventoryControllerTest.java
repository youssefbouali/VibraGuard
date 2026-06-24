package com.vibraguard.inventory.controller;

import com.vibraguard.inventory.entity.InventoryPart;
import com.vibraguard.inventory.repository.InventoryPartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryControllerTest {

    @Mock private InventoryPartRepository inventoryPartRepository;

    private InventoryController controller;

    @BeforeEach
    void setUp() {
        controller = new InventoryController();
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "inventoryPartRepository", inventoryPartRepository);
    }

    @Test
    void getInventoryParts_shouldReturnAll() {
        InventoryPart part = new InventoryPart();
        part.setId("PRT-001");
        part.setName("Bearing");
        when(inventoryPartRepository.findAll()).thenReturn(List.of(part));

        Flux<InventoryPart> result = controller.getInventoryParts();
        StepVerifier.create(result)
                .expectNextMatches(p -> p.getName().equals("Bearing"))
                .verifyComplete();
    }

    @Test
    void createInventoryPart_withoutId_shouldGenerate() {
        InventoryPart part = new InventoryPart();
        part.setName("New Part");
        when(inventoryPartRepository.count()).thenReturn(50L);
        when(inventoryPartRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        StepVerifier.create(controller.createInventoryPart(part))
                .expectNextMatches(p -> p.getId().equals("PRT-150"))
                .verifyComplete();
    }

    @Test
    void createInventoryPart_withId_shouldPreserve() {
        InventoryPart part = new InventoryPart();
        part.setId("PRT-CUSTOM");
        part.setName("Custom Part");
        when(inventoryPartRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        StepVerifier.create(controller.createInventoryPart(part))
                .expectNextMatches(p -> p.getId().equals("PRT-CUSTOM"))
                .verifyComplete();
    }

    @Test
    void decrementStock_whenStockAboveZero_shouldDecrement() {
        InventoryPart part = new InventoryPart();
        part.setId("PRT-001");
        part.setStock(10);
        when(inventoryPartRepository.findById("PRT-001")).thenReturn(Optional.of(part));
        when(inventoryPartRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        StepVerifier.create(controller.decrementStock("PRT-001"))
                .expectNextMatches(p -> p.getStock() == 9
                        && p.getStockColor().equals("#22C55E"))
                .verifyComplete();
    }

    @Test
    void decrementStock_whenStockIsLow_shouldSetRedColor() {
        InventoryPart part = new InventoryPart();
        part.setId("PRT-001");
        part.setStock(1);
        when(inventoryPartRepository.findById("PRT-001")).thenReturn(Optional.of(part));
        when(inventoryPartRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        StepVerifier.create(controller.decrementStock("PRT-001"))
                .expectNextMatches(p -> p.getStock() == 0
                        && p.getStockColor().equals("#EF4444"))
                .verifyComplete();
    }

    @Test
    void decrementStock_whenStockIsZero_shouldNotGoNegative() {
        InventoryPart part = new InventoryPart();
        part.setId("PRT-001");
        part.setStock(0);
        when(inventoryPartRepository.findById("PRT-001")).thenReturn(Optional.of(part));

        StepVerifier.create(controller.decrementStock("PRT-001"))
                .expectNextMatches(p -> p.getStock() == 0)
                .verifyComplete();
    }

    @Test
    void decrementStock_whenNotFound_shouldReturnNull() {
        when(inventoryPartRepository.findById("PRT-999")).thenReturn(Optional.empty());

        StepVerifier.create(controller.decrementStock("PRT-999"))
                .verifyComplete();
    }
}
