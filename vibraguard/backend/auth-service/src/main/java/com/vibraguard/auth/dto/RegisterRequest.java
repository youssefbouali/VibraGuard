package com.vibraguard.auth.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String fullName;
    private String phoneNumber;
    private String department;
    private String enterprise;
    private String role;
}
