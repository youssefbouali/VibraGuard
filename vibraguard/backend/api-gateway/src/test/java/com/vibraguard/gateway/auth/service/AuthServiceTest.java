package com.vibraguard.gateway.auth.service;

import com.vibraguard.gateway.auth.dto.AuthResponse;
import com.vibraguard.gateway.auth.dto.LoginRequest;
import com.vibraguard.gateway.auth.dto.RegisterRequest;
import com.vibraguard.gateway.auth.model.User;
import com.vibraguard.gateway.auth.repository.UserRepository;
import com.vibraguard.gateway.auth.util.JwtUtil;
import com.vibraguard.gateway.repository.AlertRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerThrowsWhenUserExists() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("a@b.com");
        req.setPassword("pw");
        req.setFullName("A");

        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(User.builder().email("a@b.com").build()));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.register(req));
        assertEquals("User already exists", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void registerAdminCreatesActiveUserAndToken() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("admin@b.com");
        req.setPassword("pw");
        req.setFullName("Admin");
        req.setRole("admin");

        when(userRepository.findByEmail("admin@b.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pw")).thenReturn("enc");
        when(jwtUtil.generateToken("admin@b.com")).thenReturn("jwt");

        AuthResponse res = authService.register(req);

        assertEquals("jwt", res.getToken());
        assertEquals("admin@b.com", res.getEmail());
        assertEquals("ADMIN", res.getRole());

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());
        assertEquals("ADMIN", saved.getValue().getRole());
        assertEquals("Actif", saved.getValue().getStatus());
        verify(alertRepository, never()).save(any());
    }

    @Test
    void registerNonAdminIsInactiveAndSendsNotifications() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("user@b.com");
        req.setPassword("pw");
        req.setFullName("User");
        req.setRole("user");
        req.setEnterprise("OCP");

        when(userRepository.findByEmail("user@b.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pw")).thenReturn("enc");
        when(userRepository.findAll()).thenReturn(List.of(
                User.builder().email("admin@ocp.com").role("ADMIN").enterprise("OCP").build(),
                User.builder().email("admin2@ocp.com").role("ADMIN").enterprise(null).build()
        ));

        AuthResponse res = authService.register(req);

        assertNull(res.getToken());
        assertEquals("USER", res.getRole());
        verify(alertRepository, times(2)).save(any());
    }

    @Test
    void loginFailsWhenUserNotFound() {
        LoginRequest req = new LoginRequest();
        req.setEmail("missing@b.com");
        req.setPassword("pw");

        when(userRepository.findByEmail("missing@b.com")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(req));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void loginFailsWhenPasswordInvalid() {
        LoginRequest req = new LoginRequest();
        req.setEmail("a@b.com");
        req.setPassword("pw");

        User u = User.builder().email("a@b.com").password("hash").status("Actif").role("USER").build();
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(u));
        when(passwordEncoder.matches("pw", "hash")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(req));
        assertEquals("Invalid password", ex.getMessage());
    }

    @Test
    void loginFailsWhenInactive() {
        LoginRequest req = new LoginRequest();
        req.setEmail("a@b.com");
        req.setPassword("pw");

        User u = User.builder().email("a@b.com").password("hash").status("Inactif").role("USER").build();
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(u));
        when(passwordEncoder.matches("pw", "hash")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(req));
        assertEquals("Votre compte est inactif. Veuillez contacter l'administrateur.", ex.getMessage());
    }

    @Test
    void loginReturnsTokenWhenValid() {
        LoginRequest req = new LoginRequest();
        req.setEmail("a@b.com");
        req.setPassword("pw");

        User u = User.builder()
                .email("a@b.com")
                .password("hash")
                .status("Actif")
                .role("USER")
                .fullName("A")
                .employeeId("TECH-1")
                .phoneNumber("1")
                .department("D")
                .build();
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(u));
        when(passwordEncoder.matches("pw", "hash")).thenReturn(true);
        when(jwtUtil.generateToken("a@b.com")).thenReturn("jwt");

        AuthResponse res = authService.login(req);

        assertEquals("jwt", res.getToken());
        assertEquals("a@b.com", res.getEmail());
        assertEquals("USER", res.getRole());
    }

    @Test
    void getMeReturnsUserProfile() {
        User u = User.builder()
                .email("a@b.com")
                .role("USER")
                .fullName("A")
                .employeeId("TECH-1")
                .phoneNumber("1")
                .department("D")
                .build();
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(u));

        AuthResponse res = authService.getMe("a@b.com");

        assertEquals("a@b.com", res.getEmail());
        assertEquals("A", res.getFullName());
    }

    @Test
    void getMeFromTokenDelegatesToJwtUtil() {
        when(jwtUtil.extractEmail("tok")).thenReturn("a@b.com");
        assertEquals("a@b.com", authService.getMeFromToken("tok"));
    }
}

