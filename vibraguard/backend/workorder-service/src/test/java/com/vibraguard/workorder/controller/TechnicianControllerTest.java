package com.vibraguard.workorder.controller;

import com.vibraguard.workorder.entity.Technician;
import com.vibraguard.workorder.repository.TechnicianRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TechnicianControllerTest {

    @Mock private TechnicianRepository technicianRepository;

    private TechnicianController controller;

    @BeforeEach
    void setUp() {
        controller = new TechnicianController();
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "technicianRepository", technicianRepository);
    }

    @Test
    void createTechnician_shouldSave() {
        Technician tech = new Technician();
        tech.setName("Jean Dupont");
        when(technicianRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        StepVerifier.create(controller.createTechnician(tech))
                .expectNextMatches(r -> r.getBody().getName().equals("Jean Dupont"))
                .verifyComplete();
    }

    @Test
    void getTechnicians_shouldReturnAll() {
        Technician t1 = new Technician();
        t1.setName("Tech One");
        when(technicianRepository.findAll()).thenReturn(List.of(t1));

        Flux<Technician> result = controller.getTechnicians();
        StepVerifier.create(result)
                .expectNextMatches(t -> t.getName().equals("Tech One"))
                .verifyComplete();
    }

    @Test
    void getTechnicianById_whenExists_shouldReturn() {
        Technician tech = new Technician();
        tech.setId("TECH-001");
        tech.setName("Tech One");
        when(technicianRepository.findById("TECH-001")).thenReturn(Optional.of(tech));

        StepVerifier.create(controller.getTechnicianById("TECH-001"))
                .expectNextMatches(r -> r.getStatusCode().is2xxSuccessful()
                        && r.getBody().getName().equals("Tech One"))
                .verifyComplete();
    }

    @Test
    void getTechnicianById_whenNotFound_shouldReturn404() {
        when(technicianRepository.findById("TECH-999")).thenReturn(Optional.empty());

        StepVerifier.create(controller.getTechnicianById("TECH-999"))
                .expectNextMatches(r -> r.getStatusCode().is4xxClientError())
                .verifyComplete();
    }

    @Test
    void updateTechnician_whenExists_shouldUpdate() {
        Technician existing = new Technician();
        existing.setId("TECH-001");
        existing.setName("Old Name");

        Technician update = new Technician();
        update.setName("New Name");
        update.setEmail("new@test.com");

        when(technicianRepository.findById("TECH-001")).thenReturn(Optional.of(existing));
        when(technicianRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        StepVerifier.create(controller.updateTechnician("TECH-001", update))
                .expectNextMatches(r -> r.getBody().getName().equals("New Name")
                        && r.getBody().getEmail().equals("new@test.com"))
                .verifyComplete();
    }

    @Test
    void updateTechnician_whenNotFound_shouldReturn404() {
        when(technicianRepository.findById("TECH-999")).thenReturn(Optional.empty());

        StepVerifier.create(controller.updateTechnician("TECH-999", new Technician()))
                .expectNextMatches(r -> r.getStatusCode().is4xxClientError())
                .verifyComplete();
    }

    @Test
    void deleteTechnician_shouldReturn204() {
        StepVerifier.create(controller.deleteTechnician("TECH-001"))
                .expectNextMatches(r -> r.getStatusCode().is2xxSuccessful())
                .verifyComplete();
        verify(technicianRepository).deleteById("TECH-001");
    }
}
