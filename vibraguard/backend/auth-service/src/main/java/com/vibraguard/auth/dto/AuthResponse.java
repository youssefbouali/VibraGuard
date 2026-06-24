package com.vibraguard.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String fullName;
    private String employeeId;
    private String phoneNumber;
    private String department;
    private String role;
    private Integer confidenceThreshold;
}
