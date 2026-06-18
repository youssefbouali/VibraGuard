package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.AlertStreamService;
import com.vibraguard.gateway.auth.model.User;
import com.vibraguard.gateway.entity.Alert;
import com.vibraguard.gateway.repository.AlertRepository;
import com.vibraguard.gateway.util.ControllerUtils;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AlertControllerTest {

    @Test
    void getAlertsFiltersByRecipientEmailAndSortsByTimeDesc() {
        AlertRepository alertRepository = mock(AlertRepository.class);
        AlertStreamService alertStreamService = mock(AlertStreamService.class);
        ControllerUtils utils = mock(ControllerUtils.class);

        AlertController controller = new AlertController();
        ReflectionTestUtils.setField(controller, "alertRepository", alertRepository);
        ReflectionTestUtils.setField(controller, "alertStreamService", alertStreamService);
        ReflectionTestUtils.setField(controller, "utils", utils);

        Principal principal = () -> "user@b.com";
        when(utils.currentUser(principal)).thenReturn(Optional.of(User.builder().email("user@b.com").build()));

        Alert a1 = new Alert();
        a1.setId("A1");
        a1.setTime("2026-01-01 00:00:01");
        a1.setRecipientEmail("user@b.com");

        Alert a2 = new Alert();
        a2.setId("A2");
        a2.setTime("2026-01-01 00:00:03");
        a2.setRecipientEmail(null);

        Alert a3 = new Alert();
        a3.setId("A3");
        a3.setTime("2026-01-01 00:00:02");
        a3.setRecipientEmail("other@b.com");

        when(alertRepository.findAll()).thenReturn(List.of(a1, a2, a3));

        List<Alert> res = controller.getAlerts(principal).collectList().block();
        assertNotNull(res);
        assertEquals(List.of("A2", "A1"), res.stream().map(Alert::getId).toList());
    }

    @Test
    void createAlertAssignsDefaultsAndEmits() {
        AlertRepository alertRepository = mock(AlertRepository.class);
        AlertStreamService alertStreamService = mock(AlertStreamService.class);
        ControllerUtils utils = mock(ControllerUtils.class);

        AlertController controller = new AlertController();
        ReflectionTestUtils.setField(controller, "alertRepository", alertRepository);
        ReflectionTestUtils.setField(controller, "alertStreamService", alertStreamService);
        ReflectionTestUtils.setField(controller, "utils", utils);

        when(alertRepository.count()).thenReturn(0L);
        when(alertRepository.save(any(Alert.class))).thenAnswer(inv -> inv.getArgument(0));

        Alert alert = new Alert();
        Alert saved = controller.createAlert(alert).block();

        assertNotNull(saved);
        assertNotNull(saved.getId());
        assertNotNull(saved.getTime());
        assertEquals("ALERT", saved.getType());
        verify(alertStreamService).emit(any(Alert.class));
    }

    @Test
    void updateAlertUpdatesExistingOrCreatesNew() {
        AlertRepository alertRepository = mock(AlertRepository.class);
        AlertStreamService alertStreamService = mock(AlertStreamService.class);
        ControllerUtils utils = mock(ControllerUtils.class);

        AlertController controller = new AlertController();
        ReflectionTestUtils.setField(controller, "alertRepository", alertRepository);
        ReflectionTestUtils.setField(controller, "alertStreamService", alertStreamService);
        ReflectionTestUtils.setField(controller, "utils", utils);

        Alert existing = new Alert();
        existing.setId("A1");
        existing.setStatus("Nouveau");

        when(alertRepository.findById("A1")).thenReturn(Optional.of(existing));
        when(alertRepository.save(any(Alert.class))).thenAnswer(inv -> inv.getArgument(0));

        Alert patch = new Alert();
        patch.setStatus("Read");
        Alert updated = controller.updateAlert("A1", patch).block();
        assertNotNull(updated);
        assertEquals("Read", updated.getStatus());

        when(alertRepository.findById("A2")).thenReturn(Optional.empty());
        Alert created = controller.updateAlert("A2", new Alert()).block();
        assertNotNull(created);
        assertEquals("A2", created.getId());
    }

    @Test
    void markReadEndpointsUpdateOnlyAllowedAlerts() {
        AlertRepository alertRepository = mock(AlertRepository.class);
        AlertStreamService alertStreamService = mock(AlertStreamService.class);
        ControllerUtils utils = mock(ControllerUtils.class);

        AlertController controller = new AlertController();
        ReflectionTestUtils.setField(controller, "alertRepository", alertRepository);
        ReflectionTestUtils.setField(controller, "alertStreamService", alertStreamService);
        ReflectionTestUtils.setField(controller, "utils", utils);

        Principal principal = () -> "user@b.com";
        when(utils.currentUser(principal)).thenReturn(Optional.of(User.builder().email("user@b.com").build()));

        Alert unread = new Alert();
        unread.setId("A1");
        unread.setStatus("Nouveau");
        unread.setRecipientEmail("user@b.com");

        Alert notAllowed = new Alert();
        notAllowed.setId("A2");
        notAllowed.setStatus("Nouveau");
        notAllowed.setRecipientEmail("other@b.com");

        when(alertRepository.findAll()).thenReturn(List.of(unread, notAllowed));
        when(alertRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        controller.markAllRead(principal).block();
        assertEquals("Read", unread.getStatus());
        assertEquals("Nouveau", notAllowed.getStatus());
        verify(alertRepository).saveAll(anyList());

        when(alertRepository.findById("A1")).thenReturn(Optional.of(unread));
        when(alertRepository.save(any(Alert.class))).thenAnswer(inv -> inv.getArgument(0));

        unread.setStatus("Nouveau");
        controller.markAsRead("A1", principal).block();
        assertEquals("Read", unread.getStatus());
    }
}

