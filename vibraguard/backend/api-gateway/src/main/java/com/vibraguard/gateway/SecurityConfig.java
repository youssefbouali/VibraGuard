package com.vibraguard.gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;

import com.vibraguard.gateway.auth.filter.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import org.springframework.http.HttpStatus;
import reactor.core.publisher.Mono;
@Configuration
@EnableWebFluxSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .httpBasic(httpBasic -> httpBasic.disable())
                .formLogin(formLogin -> formLogin.disable())
                .exceptionHandling(ex -> ex.authenticationEntryPoint((swe, e) -> 
                        Mono.fromRunnable(() -> swe.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED))
                ))
                .addFilterAt(jwtAuthenticationFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers("/api/v1/auth/**", "/login", "/register", "/forgot-password").permitAll()
                        .pathMatchers("/api/v1/reports/**").permitAll()
                        // Internal Spark AI processor routes — only reachable inside the K8s cluster
                        .pathMatchers(
                            "/api/v1/iot/motors/vibrations",
                            "/api/v1/iot/motors/**",
                            "/api/v1/iot/inventory-parts/decrement/**",
                            "/api/v1/ml/alerts",
                            "/api/v1/bi/kpis/upsert"
                        ).permitAll()
                        .pathMatchers("/api/v1/bi/**").hasRole("ADMIN")
                        .pathMatchers("/api/v1/blockchain/audit").hasRole("ADMIN")
                        .pathMatchers("/api/v1/iot/technicians/**").hasRole("ADMIN")
                        .pathMatchers("/api/v1/iot/**", "/api/v1/ml/**", "/api/v1/blockchain/**").authenticated()
                        .pathMatchers("/ws/**").permitAll()
                        .anyExchange().authenticated());
        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
