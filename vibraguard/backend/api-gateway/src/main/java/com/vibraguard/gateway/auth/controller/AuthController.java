package com.vibraguard.gateway.auth.controller;

import com.vibraguard.gateway.auth.dto.AuthResponse;
import com.vibraguard.gateway.auth.dto.LoginRequest;
import com.vibraguard.gateway.auth.dto.RegisterRequest;
import com.vibraguard.gateway.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import reactor.core.scheduler.Schedulers;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public Mono<ResponseEntity<AuthResponse>> register(@RequestBody RegisterRequest request) {
        return Mono.fromCallable(() -> ResponseEntity.ok(authService.register(request)))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<AuthResponse>> login(@RequestBody LoginRequest request) {
        return Mono.fromCallable(() -> ResponseEntity.ok(authService.login(request)))
                .subscribeOn(Schedulers.boundedElastic());
    }
}
