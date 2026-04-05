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

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole("USER");
        user.setEmployeeId("TECH-" + (int)(Math.random() * 9000 + 1000));
        user.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber() : "");
        user.setDepartment(request.getDepartment() != null ? request.getDepartment() : "Maintenance");

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .employeeId(user.getEmployeeId())
                .phoneNumber(user.getPhoneNumber())
                .department(user.getDepartment())
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
                .build();
    }

    @jakarta.annotation.PostConstruct
    public void seedUser() {
        if (userRepository.findByEmail("mr.boualiyoussef@gmail.com").isEmpty()) {
            User user = new User();
            user.setEmail("mr.boualiyoussef@gmail.com");
            user.setFullName("Youssef Bouali");
            user.setPassword(passwordEncoder.encode("password"));
            user.setRole("ADMIN");
            user.setEmployeeId("TECH-4892");
            user.setPhoneNumber("+212 6 00 11 22 33");
            user.setDepartment("Maintenance Prédictive");
            userRepository.save(user);
        }
    }

    public String getMeFromToken(String token) {
        return jwtUtil.extractEmail(token);
    }
}
