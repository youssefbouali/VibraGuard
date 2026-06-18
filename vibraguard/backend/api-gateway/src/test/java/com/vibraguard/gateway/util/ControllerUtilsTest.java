package com.vibraguard.gateway.util;

import com.vibraguard.gateway.auth.model.User;
import com.vibraguard.gateway.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Principal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ControllerUtilsTest {

    @Test
    void currentUserReturnsEmptyWhenPrincipalNull() {
        ControllerUtils utils = new ControllerUtils();
        ReflectionTestUtils.setField(utils, "userRepository", mock(UserRepository.class));

        assertTrue(utils.currentUser(null).isEmpty());
    }

    @Test
    void detectsAdminAndTechnicianRoles() {
        UserRepository userRepository = mock(UserRepository.class);
        ControllerUtils utils = new ControllerUtils();
        ReflectionTestUtils.setField(utils, "userRepository", userRepository);

        Principal principal = () -> "admin@example.com";

        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.of(User.builder().email("admin@example.com").role("ADMIN").build()));

        assertTrue(utils.isAdmin(principal));
        assertFalse(utils.isTechnician(principal));

        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.of(User.builder().email("admin@example.com").role("Technicien").build()));

        assertFalse(utils.isAdmin(principal));
        assertTrue(utils.isTechnician(principal));

        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.empty());

        assertFalse(utils.isAdmin(principal));
        assertFalse(utils.isTechnician(principal));
    }
}

