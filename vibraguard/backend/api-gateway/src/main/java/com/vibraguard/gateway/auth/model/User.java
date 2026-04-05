package com.vibraguard.gateway.auth.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String fullName;
    private String role;

    private String employeeId;
    private String phoneNumber;
    private String department;

    public User() {}
    public User(Long id, String email, String password, String fullName, String role, String employeeId, String phoneNumber, String department) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.employeeId = employeeId;
        this.phoneNumber = phoneNumber;
        this.department = department;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String e) { this.email = e; }
    public String getPassword() { return password; }
    public void setPassword(String p) { this.password = p; }
    public String getFullName() { return fullName; }
    public void setFullName(String f) { this.fullName = f; }
    public String getRole() { return role; }
    public void setRole(String r) { this.role = r; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String e) { this.employeeId = e; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String p) { this.phoneNumber = p; }
    public String getDepartment() { return department; }
    public void setDepartment(String d) { this.department = d; }
}
