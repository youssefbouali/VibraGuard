package com.vibraguard.motor.controller;

import com.vibraguard.motor.entity.Motor;
import com.vibraguard.motor.repository.MotorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SearchControllerTest {

    @Mock private MotorRepository motorRepository;

    private SearchController controller;

    @BeforeEach
    void setUp() {
        controller = new SearchController();
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "motorRepository", motorRepository);
    }

    @Test
    void search_byMotorId_shouldReturnMatching() {
        Motor m1 = new Motor();
        m1.setId("MTR-001");
        m1.setSite("Site A");
        Motor m2 = new Motor();
        m2.setId("MTR-002");
        m2.setSite("Site B");

        when(motorRepository.findAll()).thenReturn(List.of(m1, m2));

        Mono<Map<String, Object>> result = controller.search("001");
        StepVerifier.create(result)
                .assertNext(r -> {
                    List<Motor> motors = (List<Motor>) r.get("motors");
                    assertEquals(1, motors.size());
                    assertEquals("MTR-001", motors.get(0).getId());
                })
                .verifyComplete();
    }

    @Test
    void search_bySiteName_shouldReturnMatching() {
        Motor m1 = new Motor();
        m1.setId("MTR-001");
        m1.setSite("Site A");
        Motor m2 = new Motor();
        m2.setId("MTR-002");
        m2.setSite("Site B");

        when(motorRepository.findAll()).thenReturn(List.of(m1, m2));

        Mono<Map<String, Object>> result = controller.search("site b");
        StepVerifier.create(result)
                .assertNext(r -> {
                    List<Motor> motors = (List<Motor>) r.get("motors");
                    assertEquals(1, motors.size());
                    assertEquals("MTR-002", motors.get(0).getId());
                })
                .verifyComplete();
    }

    @Test
    void search_withNoMatch_shouldReturnEmpty() {
        when(motorRepository.findAll()).thenReturn(List.of());

        Mono<Map<String, Object>> result = controller.search("nonexistent");
        StepVerifier.create(result)
                .assertNext(r -> {
                    List<Motor> motors = (List<Motor>) r.get("motors");
                    assertTrue(motors.isEmpty());
                })
                .verifyComplete();
    }

    @Test
    void search_isCaseInsensitive() {
        Motor m = new Motor();
        m.setId("MTR-001");
        m.setSite("Alpha Site");

        when(motorRepository.findAll()).thenReturn(List.of(m));

        Mono<Map<String, Object>> result = controller.search("ALPHA");
        StepVerifier.create(result)
                .assertNext(r -> {
                    List<Motor> motors = (List<Motor>) r.get("motors");
                    assertEquals(1, motors.size());
                })
                .verifyComplete();
    }
}
