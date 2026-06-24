package com.vibraguard.alert.controller;

import com.vibraguard.alert.entity.Alert;
import com.vibraguard.alert.repository.AlertRepository;
import com.vibraguard.alert.service.AlertStreamService;
import com.vibraguard.common.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertControllerTest {

    @Mock private AlertRepository alertRepository;
    @Mock private AlertStreamService alertStreamService;
    @Mock private JwtUtil jwtUtil;

    private AlertController controller;

    @BeforeEach
    void setUp() {
        controller = new AlertController();
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "alertRepository", alertRepository);
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "alertStreamService", alertStreamService);
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "jwtUtil", jwtUtil);
    }

    @Test
    void getAlertsCount_shouldReturnCount() {
        when(alertRepository.countByType("ALERT")).thenReturn(42L);

        Mono<Map<String, Long>> result = controller.getAlertsCount();
        StepVerifier.create(result)
                .expectNextMatches(m -> m.get("count") == 42L)
                .verifyComplete();
    }

    @Test
    void createAlert_shouldSetDefaults() {
        Alert input = new Alert();
        input.setTitle("Test Alert");
        when(alertRepository.count()).thenReturn(100L);
        when(alertRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        StepVerifier.create(controller.createAlert(input))
                .expectNextMatches(a -> a.getTitle().equals("Test Alert")
                        && a.getId().equals("ALR-8503")
                        && a.getTime() != null
                        && a.getType().equals("ALERT"))
                .verifyComplete();

        verify(alertStreamService).emit(any());
    }

    @Test
    void createAlert_withRecipientEmail_shouldNotEmitToStream() {
        Alert input = new Alert();
        input.setTitle("Notification");
        input.setType("NOTIFICATION");
        input.setRecipientEmail("user@test.com");
        when(alertRepository.count()).thenReturn(100L);
        when(alertRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        StepVerifier.create(controller.createAlert(input))
                .expectNextMatches(a -> a.getTitle().equals("Notification"))
                .verifyComplete();

        verify(alertStreamService, never()).emit(any());
    }

    @Test
    void updateAlert_whenExists_shouldUpdateFields() {
        Alert existing = new Alert();
        existing.setId("ALR-001");
        existing.setStatus("Nouveau");

        Alert update = new Alert();
        update.setStatus("Read");
        update.setPriority("High");

        when(alertRepository.findById("ALR-001")).thenReturn(Optional.of(existing));
        when(alertRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        StepVerifier.create(controller.updateAlert("ALR-001", update))
                .expectNextMatches(a -> a.getStatus().equals("Read")
                        && a.getPriority().equals("High"))
                .verifyComplete();
    }

    @Test
    void updateAlert_whenNotFound_shouldCreateNew() {
        Alert update = new Alert();
        update.setStatus("Read");
        when(alertRepository.findById("ALR-999")).thenReturn(Optional.empty());
        when(alertRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        StepVerifier.create(controller.updateAlert("ALR-999", update))
                .expectNextMatches(a -> a.getId().equals("ALR-999"))
                .verifyComplete();
    }

    @Test
    void markAllRead_shouldUpdateAllNewAlerts() {
        Alert a1 = new Alert();
        a1.setStatus("Nouveau");
        Alert a2 = new Alert();
        a2.setStatus("Nouveau");
        Alert a3 = new Alert();
        a3.setStatus("Read");

        when(alertRepository.findAll()).thenReturn(List.of(a1, a2, a3));

        StepVerifier.create(controller.markAllRead()).verifyComplete();
        verify(alertRepository).saveAll(argThat(list -> {
            List<Alert> alerts = (List<Alert>) list;
            return alerts.stream().allMatch(a -> a.getStatus().equals("Read"));
        }));
    }

    @Test
    void markAsRead_whenExists_shouldSetRead() {
        Alert alert = new Alert();
        alert.setId("ALR-001");
        alert.setStatus("Nouveau");
        when(alertRepository.findById("ALR-001")).thenReturn(Optional.of(alert));
        when(alertRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        StepVerifier.create(controller.markAsRead("ALR-001")).verifyComplete();
        verify(alertRepository).save(argThat(a -> a.getStatus().equals("Read")));
    }

    @Test
    void getAlerts_shouldFilterByEmailAndThreshold() {
        Alert alert = new Alert();
        alert.setId("ALR-001");
        alert.setTitle("Test");
        alert.setRecipientEmail("user@test.com");
        alert.setScoreConfianceIA(80.0);
        alert.setTime("2024-01-01 10:00:00");

        when(alertRepository.findAll()).thenReturn(List.of(alert));
        when(jwtUtil.extractEmail("jwt.token")).thenReturn("user@test.com");

        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/ml/alerts")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer jwt.token")
                        .build());

        Flux<Alert> result = controller.getAlerts(exchange, 70);
        StepVerifier.create(result)
                .expectNextMatches(a -> a.getId().equals("ALR-001"))
                .verifyComplete();
    }
}
