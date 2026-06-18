package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.entity.InventoryPart;
import com.vibraguard.gateway.repository.InventoryPartRepository;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InventoryControllerTest {

    @Test
    void createInventoryPartAssignsIdWhenMissing() {
        InventoryPartRepository repo = mock(InventoryPartRepository.class);
        InventoryController controller = new InventoryController();
        ReflectionTestUtils.setField(controller, "inventoryPartRepository", repo);

        when(repo.count()).thenReturn(0L);
        when(repo.save(any(InventoryPart.class))).thenAnswer(inv -> inv.getArgument(0));

        InventoryPart part = new InventoryPart();
        part.setName("P");
        InventoryPart saved = controller.createInventoryPart(part).block();

        assertNotNull(saved);
        assertEquals("PRT-100", saved.getId());
    }

    @Test
    void decrementStockUpdatesColorWhenStockPositive() {
        InventoryPartRepository repo = mock(InventoryPartRepository.class);
        InventoryController controller = new InventoryController();
        ReflectionTestUtils.setField(controller, "inventoryPartRepository", repo);

        InventoryPart part = new InventoryPart("PRT-1", "P", 3, null);
        when(repo.findById("PRT-1")).thenReturn(Optional.of(part));

        InventoryPart res = controller.decrementStock("PRT-1").block();
        assertNotNull(res);
        assertEquals(2, res.getStock());
        assertEquals("#EF4444", res.getStockColor());
        verify(repo).save(part);

        part.setStock(0);
        InventoryPart res2 = controller.decrementStock("PRT-1").block();
        assertNotNull(res2);
        assertEquals(0, res2.getStock());
    }

    @Test
    void getInventoryPartsReturnsAllParts() {
        InventoryPartRepository repo = mock(InventoryPartRepository.class);
        InventoryController controller = new InventoryController();
        ReflectionTestUtils.setField(controller, "inventoryPartRepository", repo);

        when(repo.findAll()).thenReturn(List.of(new InventoryPart("P1", "Part", 1, null)));
        var res = controller.getInventoryParts().collectList().block();
        assertNotNull(res);
        assertEquals(1, res.size());
    }
}

