package com.vibraguard.auth.controller;

import com.vibraguard.auth.dto.TechnicianResponse;
import com.vibraguard.auth.model.User;
import com.vibraguard.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/iot/technicians")
@RequiredArgsConstructor
public class TechnicianController {

    private final UserRepository userRepository;

    @GetMapping
    public List<TechnicianResponse> getTechnicians() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TechnicianResponse> getTechnicianById(@PathVariable String id) {
        return userRepository.findAll().stream()
                .filter(u -> id.equals(u.getEmployeeId()))
                .findFirst()
                .map(u -> ResponseEntity.ok(toResponse(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TechnicianResponse> updateTechnician(@PathVariable String id, @RequestBody TechnicianResponse request) {
        Optional<User> existing = userRepository.findAll().stream()
                .filter(u -> id.equals(u.getEmployeeId()))
                .findFirst();

        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = existing.get();
        if (request.getName() != null) user.setFullName(request.getName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getStatus() != null) user.setStatus(request.getStatus());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());

        userRepository.save(user);
        return ResponseEntity.ok(toResponse(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTechnician(@PathVariable String id) {
        Optional<User> existing = userRepository.findAll().stream()
                .filter(u -> id.equals(u.getEmployeeId()))
                .findFirst();

        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        userRepository.delete(existing.get());
        return ResponseEntity.noContent().build();
    }

    private TechnicianResponse toResponse(User user) {
        return TechnicianResponse.builder()
                .id(user.getEmployeeId())
                .name(user.getFullName())
                .email(user.getEmail())
                .department(user.getDepartment())
                .role(user.getRole())
                .status(user.getStatus())
                .phoneNumber(user.getPhoneNumber())
                .lastConnection(null)
                .avatarUrl(null)
                .build();
    }
}
