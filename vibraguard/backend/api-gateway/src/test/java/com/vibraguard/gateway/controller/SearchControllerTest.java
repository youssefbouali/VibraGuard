package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.entity.Alert;
import com.vibraguard.gateway.entity.Motor;
import com.vibraguard.gateway.repository.AlertRepository;
import com.vibraguard.gateway.repository.MotorRepository;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SearchControllerTest {

    @Test
    void searchReturnsMatchingMotorsAndAlerts() {
        MotorRepository motorRepository = mock(MotorRepository.class);
        AlertRepository alertRepository = mock(AlertRepository.class);

        SearchController controller = new SearchController();
        ReflectionTestUtils.setField(controller, "motorRepository", motorRepository);
        ReflectionTestUtils.setField(controller, "alertRepository", alertRepository);

        Motor m1 = new Motor();
        m1.setId("MTR-1");
        m1.setSite("Site A");
        Motor m2 = new Motor();
        m2.setId("X");
        m2.setSite("Other");
        when(motorRepository.findAll()).thenReturn(List.of(m1, m2));

        Alert a1 = new Alert();
        a1.setMessage("Site A alert");
        Alert a2 = new Alert();
        a2.setMessage("Other");
        when(alertRepository.findAll()).thenReturn(List.of(a1, a2));

        Map<String, Object> res = controller.search("site").block();
        assertNotNull(res);
        assertEquals(1, ((List<?>) res.get("motors")).size());
        assertEquals(1, ((List<?>) res.get("alerts")).size());
    }
}

