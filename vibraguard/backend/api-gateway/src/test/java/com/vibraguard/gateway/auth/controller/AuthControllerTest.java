package com.vibraguard.gateway.auth.controller;

import com.vibraguard.gateway.auth.dto.AuthResponse;
import com.vibraguard.gateway.auth.dto.LoginRequest;
import com.vibraguard.gateway.auth.dto.RegisterRequest;
import com.vibraguard.gateway.auth.service.AuthService;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.Mockito.*;

class AuthControllerTest {

    @Test
    void registerDelegatesToService() {
        AuthService authService = mock(AuthService.class);
        AuthController controller = new AuthController(authService);

        RegisterRequest req = new RegisterRequest();
        req.setEmail("a@b.com");

        when(authService.register(req)).thenReturn(AuthResponse.builder().email("a@b.com").token("t").build());

        Mono<?> mono = controller.register(req);

        StepVerifier.create(mono)
                .expectNextMatches(r -> {
                    var res = (org.springframework.http.ResponseEntity<AuthResponse>) r;
                    return res.getBody() != null && "t".equals(res.getBody().getToken());
                })
                .verifyComplete();

        verify(authService).register(req);
    }

    @Test
    void loginDelegatesToService() {
        AuthService authService = mock(AuthService.class);
        AuthController controller = new AuthController(authService);

        LoginRequest req = new LoginRequest();
        req.setEmail("a@b.com");
        req.setPassword("pw");

        when(authService.login(req)).thenReturn(AuthResponse.builder().email("a@b.com").token("t").build());

        StepVerifier.create(controller.login(req))
                .expectNextMatches(r -> {
                    var res = (org.springframework.http.ResponseEntity<AuthResponse>) r;
                    return res.getBody() != null && "a@b.com".equals(res.getBody().getEmail());
                })
                .verifyComplete();

        verify(authService).login(req);
    }

    @Test
    void getMeExtractsBearerToken() {
        AuthService authService = mock(AuthService.class);
        AuthController controller = new AuthController(authService);

        when(authService.getMeFromToken("tok")).thenReturn("a@b.com");
        when(authService.getMe("a@b.com")).thenReturn(AuthResponse.builder().email("a@b.com").build());

        StepVerifier.create(controller.getMe("Bearer tok"))
                .expectNextMatches(r -> {
                    var res = (org.springframework.http.ResponseEntity<AuthResponse>) r;
                    return res.getBody() != null && "a@b.com".equals(res.getBody().getEmail());
                })
                .verifyComplete();
    }
}

