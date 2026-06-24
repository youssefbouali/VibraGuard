package com.vibraguard.auth.controller;

import com.vibraguard.auth.dto.TechnicianResponse;
import com.vibraguard.auth.model.User;
import com.vibraguard.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TechnicianControllerTest {

    @Mock private UserRepository userRepository;

    private TechnicianController controller;

    @BeforeEach
    void setUp() {
        controller = new TechnicianController(userRepository);
    }

    @Test
    void getTechnicians_shouldReturnAll() {
        User tech1 = User.builder().employeeId("TECH-001").fullName("Tech One").build();
        User tech2 = User.builder().employeeId("TECH-002").fullName("Tech Two").build();
        when(userRepository.findAll()).thenReturn(List.of(tech1, tech2));

        List<TechnicianResponse> result = controller.getTechnicians();

        assertEquals(2, result.size());
        assertEquals("Tech One", result.get(0).getName());
    }

    @Test
    void getTechnicianById_whenExists_shouldReturn() {
        User tech = User.builder().employeeId("TECH-001").fullName("Tech One").build();
        when(userRepository.findAll()).thenReturn(List.of(tech));

        ResponseEntity<TechnicianResponse> response = controller.getTechnicianById("TECH-001");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Tech One", response.getBody().getName());
    }

    @Test
    void getTechnicianById_whenNotFound_shouldReturnNotFound() {
        when(userRepository.findAll()).thenReturn(List.of());

        ResponseEntity<TechnicianResponse> response = controller.getTechnicianById("TECH-999");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void updateTechnician_whenExists_shouldUpdate() {
        User existing = User.builder().employeeId("TECH-001").fullName("Old Name").email("old@test.com").build();
        when(userRepository.findAll()).thenReturn(List.of(existing));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        TechnicianResponse request = TechnicianResponse.builder().name("New Name").build();
        ResponseEntity<TechnicianResponse> response = controller.updateTechnician("TECH-001", request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("New Name", response.getBody().getName());
        verify(userRepository).save(any());
    }

    @Test
    void updateTechnician_whenNotFound_shouldReturnNotFound() {
        when(userRepository.findAll()).thenReturn(List.of());
        TechnicianResponse request = TechnicianResponse.builder().name("New Name").build();

        ResponseEntity<TechnicianResponse> response = controller.updateTechnician("TECH-999", request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(userRepository, never()).save(any());
    }

    @Test
    void deleteTechnician_whenExists_shouldDelete() {
        User tech = User.builder().employeeId("TECH-001").build();
        when(userRepository.findAll()).thenReturn(List.of(tech));

        ResponseEntity<Void> response = controller.deleteTechnician("TECH-001");

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(userRepository).delete(tech);
    }

    @Test
    void deleteTechnician_whenNotFound_shouldReturnNotFound() {
        when(userRepository.findAll()).thenReturn(List.of());

        ResponseEntity<Void> response = controller.deleteTechnician("TECH-999");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(userRepository, never()).delete(any());
    }

    @Test
    void getTechnicians_whenEmpty_shouldReturnEmptyList() {
        when(userRepository.findAll()).thenReturn(List.of());
        assertTrue(controller.getTechnicians().isEmpty());
    }
}
