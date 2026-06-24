package com.vibraguard.auth.service;

import com.vibraguard.auth.dto.AuthResponse;
import com.vibraguard.auth.dto.LoginRequest;
import com.vibraguard.auth.dto.RegisterRequest;
import com.vibraguard.auth.model.User;
import com.vibraguard.auth.repository.UserRepository;
import com.vibraguard.common.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private RestTemplate restTemplate;
    @Captor private ArgumentCaptor<User> userCaptor;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtUtil, restTemplate);
    }

    @Test
    void register_whenUserAlreadyExists_shouldThrow() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@test.com");
        when(userRepository.findByEmail("existing@test.com")).thenReturn(Optional.of(new User()));

        assertThrows(RuntimeException.class, () -> authService.register(request, null));
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_withoutAdmin_shouldSetInactif() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@test.com");
        request.setPassword("pass123");
        request.setFullName("Test User");

        when(userRepository.findByEmail("new@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pass123")).thenReturn("encoded_pass");

        AuthResponse response = authService.register(request, null);

        assertNull(response.getToken());
        assertEquals("new@test.com", response.getEmail());
        assertEquals("Test User", response.getFullName());

        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertEquals("Inactif", saved.getStatus());
        assertEquals("USER", saved.getRole());
    }

    @Test
    void register_withAdminAndActifStatusAndAdminRole_shouldSetActif() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("tech@test.com");
        request.setPassword("pass123");
        request.setFullName("Tech User");
        request.setRole("ADMIN");
        request.setStatus("Actif");

        User adminUser = User.builder().email("admin@test.com").role("ADMIN").build();

        when(userRepository.findByEmail("tech@test.com")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));
        when(passwordEncoder.encode("pass123")).thenReturn("encoded_pass");
        when(jwtUtil.generateToken("tech@test.com")).thenReturn("token123");

        AuthResponse response = authService.register(request, "admin@test.com");

        assertEquals("token123", response.getToken());
        verify(userRepository).save(userCaptor.capture());
        assertEquals("Actif", userCaptor.getValue().getStatus());
    }

    @Test
    void login_withValidCredentials_shouldReturnToken() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@test.com");
        request.setPassword("correctpass");

        User user = User.builder()
                .email("user@test.com")
                .password("encoded_pass")
                .role("USER")
                .status("Actif")
                .fullName("Test User")
                .build();

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correctpass", "encoded_pass")).thenReturn(true);
        when(jwtUtil.generateToken("user@test.com")).thenReturn("jwt_token");

        AuthResponse response = authService.login(request);

        assertEquals("jwt_token", response.getToken());
        assertEquals("user@test.com", response.getEmail());
    }

    @Test
    void login_withWrongPassword_shouldThrow() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@test.com");
        request.setPassword("wrongpass");

        User user = User.builder().email("user@test.com").password("encoded_pass").build();

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpass", "encoded_pass")).thenReturn(false);

        assertThrows(RuntimeException.class, () -> authService.login(request));
    }

    @Test
    void login_withInactiveAccount_shouldThrow() {
        LoginRequest request = new LoginRequest();
        request.setEmail("inactive@test.com");
        request.setPassword("pass");

        User user = User.builder()
                .email("inactive@test.com")
                .password("encoded_pass")
                .status("Inactif")
                .build();

        when(userRepository.findByEmail("inactive@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass", "encoded_pass")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(request));
        assertTrue(ex.getMessage().contains("inactif"));
    }

    @Test
    void updateConfidenceThreshold_shouldClampToValidRange() {
        User user = User.builder().email("user@test.com").confidenceThreshold(51).build();
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));

        authService.updateConfidenceThreshold("user@test.com", 30);
        verify(userRepository).save(userCaptor.capture());
        assertEquals(51, userCaptor.getValue().getConfidenceThreshold());

        authService.updateConfidenceThreshold("user@test.com", 95);
        verify(userRepository, times(2)).save(userCaptor.capture());
        assertEquals(95, userCaptor.getAllValues().get(1).getConfidenceThreshold());

        authService.updateConfidenceThreshold("user@test.com", 150);
        verify(userRepository, times(3)).save(userCaptor.capture());
        assertEquals(100, userCaptor.getAllValues().get(2).getConfidenceThreshold());
    }

    @Test
    void getMeFromToken_shouldExtractEmail() {
        when(jwtUtil.extractEmail("some.jwt.token")).thenReturn("user@test.com");
        assertEquals("user@test.com", authService.getMeFromToken("some.jwt.token"));
    }
}
