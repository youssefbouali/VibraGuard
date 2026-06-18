package com.vibraguard.gateway.auth.filter;

import com.vibraguard.gateway.auth.model.User;
import com.vibraguard.gateway.auth.repository.UserRepository;
import com.vibraguard.gateway.auth.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.Date;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtAuthenticationFilterTest {

    @Test
    void passesThroughWhenNoAuthorizationHeader() {
        JwtUtil jwtUtil = mock(JwtUtil.class);
        UserRepository userRepository = mock(UserRepository.class);
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtUtil, userRepository);

        MockServerWebExchange exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/").build());

        AtomicReference<Authentication> authRef = new AtomicReference<>();
        WebFilterChain chain = ex -> ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .doOnNext(authRef::set)
                .then();

        filter.filter(exchange, chain).block();
        assertNull(authRef.get());
    }

    @Test
    void setsSecurityContextWhenTokenValidAndUserFound() {
        JwtUtil jwtUtil = mock(JwtUtil.class);
        UserRepository userRepository = mock(UserRepository.class);
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtUtil, userRepository);

        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer tok")
                        .build()
        );

        when(jwtUtil.extractEmail("tok")).thenReturn("a@b.com");
        when(jwtUtil.extractExpiration("tok")).thenReturn(new Date(System.currentTimeMillis() + 60_000));
        when(userRepository.findByEmail("a@b.com"))
                .thenReturn(Optional.of(User.builder().email("a@b.com").role("ADMIN TECHNICIEN").build()));

        AtomicReference<Authentication> authRef = new AtomicReference<>();
        WebFilterChain chain = ex -> ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .doOnNext(authRef::set)
                .then();

        filter.filter(exchange, chain).block();

        assertNotNull(authRef.get());
        assertEquals("a@b.com", authRef.get().getPrincipal());
        assertTrue(authRef.get().getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        assertTrue(authRef.get().getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_TECHNICIAN")));
    }

    @Test
    void ignoresInvalidToken() {
        JwtUtil jwtUtil = mock(JwtUtil.class);
        UserRepository userRepository = mock(UserRepository.class);
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtUtil, userRepository);

        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer bad")
                        .build()
        );

        when(jwtUtil.extractEmail("bad")).thenThrow(new RuntimeException("bad"));

        AtomicReference<Authentication> authRef = new AtomicReference<>();
        WebFilterChain chain = ex -> ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .doOnNext(authRef::set)
                .then();

        filter.filter(exchange, chain).block();
        assertNull(authRef.get());
    }
}

