package com.vibraguard.auth.service;

import com.vibraguard.auth.dto.AuthResponse;
import com.vibraguard.auth.dto.LoginRequest;
import com.vibraguard.auth.dto.RegisterRequest;
import com.vibraguard.auth.model.User;
import com.vibraguard.auth.repository.UserRepository;
import com.vibraguard.common.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RestTemplate restTemplate;

    public AuthResponse register(RegisterRequest request, String adminEmail) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        String role = request.getRole() != null ? request.getRole().toUpperCase() : "USER";
        String status = request.getStatus();

        if (adminEmail != null) {
            User admin = userRepository.findByEmail(adminEmail)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            if ("Actif".equals(status) && !"ADMIN".equals(admin.getRole())) {
                status = "Inactif";
            } else if (status == null) {
                status = "Actif";
                if (!"ADMIN".equals(role)) {
                    status = "Inactif";
                }
            }
        } else {
            if ("Actif".equals(status)) {
                status = "Inactif";
            } else if (status == null) {
                status = "Inactif";
            }
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .status(status)
                .enterprise(request.getEnterprise())
                .employeeId("TECH-" + (int)(Math.random() * 9000 + 1000))
                .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber() : "")
                .department(request.getDepartment() != null ? request.getDepartment() : "Maintenance")
                .build();

        userRepository.save(user);

        if ("Inactif".equals(status)) {
            sendNotificationToEnterpriseAdmins(user);
        }

        String token = "Inactif".equals(status) ? null : jwtUtil.generateToken(user.getEmail());
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

        if ("Inactif".equalsIgnoreCase(user.getStatus())) {
            throw new RuntimeException("Votre compte est inactif. Veuillez contacter l'administrateur.");
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

    public String getMeFromToken(String token) {
        return jwtUtil.extractEmail(token);
    }

    @jakarta.annotation.PostConstruct
    public void seedUser() {
        var existing = userRepository.findByEmail("mr.boualiyoussef@gmail.com");
        if (existing.isEmpty()) {
            User user = User.builder()
                    .email("mr.boualiyoussef@gmail.com")
                    .fullName("Youssef Bouali")
                    .password(passwordEncoder.encode("password"))
                    .role("ADMIN")
                    .status("Actif")
                    .enterprise("OCP Group")
                    .employeeId("TECH-4892")
                    .phoneNumber("+212 6 00 11 22 33")
                    .department("Maintenance Prédictive")
                    .build();
            userRepository.save(user);
        } else if (existing.get().getStatus() == null) {
            User user = existing.get();
            user.setStatus("Actif");
            userRepository.save(user);
        }
        // Fix any other users with null status
        userRepository.findAll().stream()
                .filter(u -> u.getStatus() == null)
                .forEach(u -> {
                    u.setStatus("Actif");
                    userRepository.save(u);
                });
    }

    private void sendNotificationToEnterpriseAdmins(User newUser) {
        if (newUser.getEnterprise() == null) return;

        List<User> admins = userRepository.findAll().stream()
                .filter(u -> "ADMIN".equalsIgnoreCase(u.getRole())
                        && (u.getEnterprise() == null || newUser.getEnterprise().equalsIgnoreCase(u.getEnterprise()))
                        && !u.getEmail().equals(newUser.getEmail()))
                .collect(Collectors.toList());

        for (User admin : admins) {
            try {
                java.util.Map<String, Object> alert = new java.util.HashMap<>();
                alert.put("id", "REG-" + UUID.randomUUID().toString().substring(0, 8));
                alert.put("title", "Nouvelle inscription : " + newUser.getFullName());
                alert.put("message", "Un nouvel utilisateur (" + newUser.getEmail() + ") s'est inscrit pour l'entreprise "
                        + newUser.getEnterprise() + ". Veuillez valider son compte.");
                alert.put("level", "Info");
                alert.put("priority", "Moyenne");
                alert.put("status", "Nouveau");
                alert.put("type", "NOTIFICATION");
                alert.put("recipientEmail", admin.getEmail());
                alert.put("time", new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date()));
                alert.put("color", "#10B981");

                restTemplate.postForEntity(
                        "http://alert-service:8083/api/v1/ml/alerts",
                        alert,
                        Void.class
                );
            } catch (Exception e) {
                System.err.println("Failed to send notification: " + e.getMessage());
            }
        }
    }
}
