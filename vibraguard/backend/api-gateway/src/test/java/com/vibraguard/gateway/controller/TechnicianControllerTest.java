package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.auth.model.User;
import com.vibraguard.gateway.auth.repository.UserRepository;
import com.vibraguard.gateway.util.ControllerUtils;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TechnicianControllerTest {

    @Test
    void getTechniciansMapsUsersWithDefaults() {
        UserRepository userRepository = mock(UserRepository.class);
        ControllerUtils utils = mock(ControllerUtils.class);

        TechnicianController controller = new TechnicianController();
        ReflectionTestUtils.setField(controller, "userRepository", userRepository);
        ReflectionTestUtils.setField(controller, "utils", utils);

        User u = new User();
        u.setId(1L);
        u.setFullName("Tech");
        u.setEmail("t@b.com");
        when(userRepository.findAll()).thenReturn(List.of(u));

        var res = controller.getTechnicians().collectList().block();
        assertNotNull(res);
        assertEquals("1", res.get(0).get("id"));
        assertEquals("Tech", res.get(0).get("name"));
        assertEquals("Technicien", res.get(0).get("role"));
        assertEquals("Maintenance", res.get(0).get("department"));
        assertEquals("Actif", res.get(0).get("status"));
    }

    @Test
    void getByIdAndUpdateAndDelete() {
        UserRepository userRepository = mock(UserRepository.class);
        ControllerUtils utils = mock(ControllerUtils.class);

        TechnicianController controller = new TechnicianController();
        ReflectionTestUtils.setField(controller, "userRepository", userRepository);
        ReflectionTestUtils.setField(controller, "utils", utils);

        User u = new User();
        u.setId(2L);
        u.setFullName("Tech");
        when(userRepository.findById(2L)).thenReturn(Optional.of(u));

        var byId = controller.getTechnicianById("2").block();
        assertNotNull(byId);
        assertEquals(HttpStatus.OK, byId.getStatusCode());

        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        User patch = new User();
        patch.setFullName("Updated");
        var updated = controller.updateTechnician("2", patch).block();
        assertNotNull(updated);
        assertEquals("Updated", updated.getBody().getFullName());

        Principal principal = () -> "admin@b.com";
        when(utils.currentUser(principal)).thenReturn(Optional.of(User.builder().id(2L).build()));

        var forbidden = controller.deleteTechnician("2", principal).block();
        assertNotNull(forbidden);
        assertEquals(HttpStatus.FORBIDDEN, forbidden.getStatusCode());

        when(utils.currentUser(principal)).thenReturn(Optional.of(User.builder().id(1L).build()));
        var ok = controller.deleteTechnician("2", principal).block();
        assertNotNull(ok);
        assertEquals(HttpStatus.NO_CONTENT, ok.getStatusCode());
        verify(userRepository).deleteById(2L);
    }
}

