package com.vibraguard.gateway.auth.service;

import com.vibraguard.gateway.auth.dto.AuthResponse;
import com.vibraguard.gateway.auth.dto.LoginRequest;
import com.vibraguard.gateway.auth.dto.RegisterRequest;
import com.vibraguard.gateway.auth.model.User;
import com.vibraguard.gateway.auth.repository.UserRepository;
import com.vibraguard.gateway.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role("USER")
                .employeeId("TECH-" + (int)(Math.random() * 9000 + 1000))
                .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber() : "")
                .department(request.getDepartment() != null ? request.getDepartment() : "Maintenance")
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .employeeId(user.getEmployeeId())
                .phoneNumber(user.getPhoneNumber())
                .department(user.getDepartment())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .employeeId(user.getEmployeeId())
                .phoneNumber(user.getPhoneNumber())
                .department(user.getDepartment())
                .role(user.getRole())
                .build();
    }

    public AuthResponse getMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return AuthResponse.builder()
                .email(user.getEmail())
                .fullName(user.getFullName())
                .employeeId(user.getEmployeeId())
                .phoneNumber(user.getPhoneNumber())
                .department(user.getDepartment())
                .role(user.getRole())
                .build();
    }

    @jakarta.annotation.PostConstruct
    public void seedUser() {
        if (userRepository.findByEmail("mr.boualiyoussef@gmail.com").isEmpty()) {
            User user = User.builder()
                    .email("mr.boualiyoussef@gmail.com")
                    .fullName("Youssef Bouali")
                    .password(passwordEncoder.encode("password"))
                    .role("ADMIN")
                    .employeeId("TECH-4892")
                    .phoneNumber("+212 6 00 11 22 33")
                    .department("Maintenance Prédictive")
                    .build();
            userRepository.save(user);
        }
    }

    public String getMeFromToken(String token) {
        return jwtUtil.extractEmail(token);
    }
}
