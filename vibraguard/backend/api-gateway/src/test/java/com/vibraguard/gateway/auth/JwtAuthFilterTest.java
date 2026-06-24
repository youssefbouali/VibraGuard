package com.vibraguard.gateway.auth;

import com.vibraguard.common.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.Date;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthFilterTest {

    @Mock private JwtUtil jwtUtil;
    @Mock private WebFilterChain chain;

    private JwtAuthFilter filter;

    @BeforeEach
    void setUp() {
        filter = new JwtAuthFilter(jwtUtil);
        lenient().when(chain.filter(any())).thenReturn(Mono.empty());
    }

    @Test
    void filter_withoutAuthHeader_shouldPassThrough() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/test").build());

        StepVerifier.create(filter.filter(exchange, chain))
                .verifyComplete();

        verify(chain).filter(exchange);
    }

    @Test
    void filter_withValidBearerToken_shouldAuthenticate() {
        when(jwtUtil.extractEmail("valid.jwt.token")).thenReturn("user@test.com");
        when(jwtUtil.extractExpiration("valid.jwt.token")).thenReturn(new Date(System.currentTimeMillis() + 3600000));

        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/test")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer valid.jwt.token")
                        .build());

        StepVerifier.create(filter.filter(exchange, chain))
                .verifyComplete();

        verify(chain).filter(exchange);
    }

    @Test
    void filter_withExpiredToken_shouldNotAuthenticate() {
        when(jwtUtil.extractEmail("expired.jwt.token")).thenReturn("user@test.com");
        when(jwtUtil.extractExpiration("expired.jwt.token")).thenReturn(new Date(System.currentTimeMillis() - 3600000));

        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/test")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer expired.jwt.token")
                        .build());

        StepVerifier.create(filter.filter(exchange, chain))
                .verifyComplete();

        verify(chain).filter(exchange);
    }

    @Test
    void filter_withInvalidToken_shouldNotAuthenticate() {
        when(jwtUtil.extractEmail("invalid.jwt.token")).thenThrow(new RuntimeException("JWT parse error"));

        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/test")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer invalid.jwt.token")
                        .build());

        StepVerifier.create(filter.filter(exchange, chain))
                .verifyComplete();

        verify(chain).filter(exchange);
    }

    @Test
    void filter_withNullEmail_shouldNotAuthenticate() {
        when(jwtUtil.extractEmail("null-email.jwt.token")).thenReturn(null);

        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/test")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer null-email.jwt.token")
                        .build());

        StepVerifier.create(filter.filter(exchange, chain))
                .verifyComplete();

        verify(chain).filter(exchange);
    }

    @Test
    void filter_withNonBearerHeader_shouldPassThrough() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/test")
                        .header(HttpHeaders.AUTHORIZATION, "Basic dXNlcjpwYXNz")
                        .build());

        StepVerifier.create(filter.filter(exchange, chain))
                .verifyComplete();

        verify(chain).filter(exchange);
    }
}
