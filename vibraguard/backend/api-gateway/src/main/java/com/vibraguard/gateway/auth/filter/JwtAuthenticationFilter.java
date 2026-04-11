package com.vibraguard.gateway.auth.filter;

import com.vibraguard.gateway.auth.model.User;
import com.vibraguard.gateway.auth.repository.UserRepository;
import com.vibraguard.gateway.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.ArrayList;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements WebFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String email = jwtUtil.extractEmail(token);
                if (email != null && !jwtUtil.extractExpiration(token).before(new Date())) {
                    System.out.println("JWT Valid for: " + email);
                    return Mono.fromCallable(() -> userRepository.findByEmail(email).orElse(null))
                            .subscribeOn(Schedulers.boundedElastic())
                            .flatMap(user -> {
                                if (user == null) {
                                    return chain.filter(exchange);
                                }

                                ArrayList<SimpleGrantedAuthority> authorities = new ArrayList<>();
                                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                                if (user.getRole() != null) {
                                    String role = user.getRole().toUpperCase();
                                    if (role.contains("ADMIN")) {
                                        authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                                    }
                                    if (role.contains("TECHNICIEN") || role.contains("TECHNICIAN")) {
                                        authorities.add(new SimpleGrantedAuthority("ROLE_TECHNICIAN"));
                                    }
                                }

                                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                        email,
                                        null,
                                        authorities);
                                return chain.filter(exchange)
                                        .contextWrite(ReactiveSecurityContextHolder.withAuthentication(auth));
                            })
                            .onErrorResume(e -> {
                                System.out.println("JWT Validation Error: " + e.getMessage());
                                return chain.filter(exchange);
                            });
                }
            } catch (Exception e) {
                System.out.println("JWT Validation Error: " + e.getMessage());
            }
        }

        return chain.filter(exchange);
    }
}
