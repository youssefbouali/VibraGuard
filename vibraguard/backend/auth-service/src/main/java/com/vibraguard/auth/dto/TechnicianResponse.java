package com.vibraguard.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianResponse {
    private String id;
    private String name;
    private String email;
    private String department;
    private String role;
    private String status;
    private String phoneNumber;
    private String lastConnection;
    private String avatarUrl;
}
