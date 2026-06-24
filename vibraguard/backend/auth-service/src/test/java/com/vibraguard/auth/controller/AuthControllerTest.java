package com.vibraguard.auth.controller;

import com.vibraguard.auth.dto.AuthResponse;
import com.vibraguard.auth.dto.LoginRequest;
import com.vibraguard.auth.dto.RegisterRequest;
import com.vibraguard.auth.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock private AuthService authService;

    private AuthController controller;

    @BeforeEach
    void setUp() {
        controller = new AuthController(authService);
    }

    @Test
    void register_withoutToken_shouldRegister() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@test.com");
        request.setPassword("pass");
        when(authService.register(request, null)).thenReturn(AuthResponse.builder().email("new@test.com").build());

        ResponseEntity<AuthResponse> response = controller.register(request, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("new@test.com", response.getBody().getEmail());
        verify(authService).register(request, null);
    }

    @Test
    void register_withToken_shouldExtractAdminEmail() {
        RegisterRequest request = new RegisterRequest();
        AuthResponse expected = AuthResponse.builder().email("tech@test.com").build();
        when(authService.getMeFromToken("jwt.token")).thenReturn("admin@test.com");
        when(authService.register(request, "admin@test.com")).thenReturn(expected);

        ResponseEntity<AuthResponse> response = controller.register(request, "Bearer jwt.token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("tech@test.com", response.getBody().getEmail());
    }

    @Test
    void login_shouldReturnToken() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@test.com");
        request.setPassword("pass");
        AuthResponse expected = AuthResponse.builder().email("user@test.com").token("jwt").build();
        when(authService.login(request)).thenReturn(expected);

        ResponseEntity<AuthResponse> response = controller.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("jwt", response.getBody().getToken());
    }

    @Test
    void getMe_shouldReturnUser() {
        when(authService.getMeFromToken("jwt.token")).thenReturn("user@test.com");
        when(authService.getMe("user@test.com")).thenReturn(AuthResponse.builder().email("user@test.com").fullName("Test User").build());

        ResponseEntity<AuthResponse> response = controller.getMe("Bearer jwt.token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Test User", response.getBody().getFullName());
    }

    @Test
    void updateConfidenceThreshold_withValidBody_shouldUpdate() {
        when(authService.getMeFromToken("jwt.token")).thenReturn("user@test.com");

        ResponseEntity<Void> response = controller.updateConfidenceThreshold("Bearer jwt.token", Map.of("confidenceThreshold", 75));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(authService).updateConfidenceThreshold("user@test.com", 75);
    }
}
