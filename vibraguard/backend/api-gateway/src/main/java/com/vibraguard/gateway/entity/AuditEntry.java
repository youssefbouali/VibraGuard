package com.vibraguard.gateway.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "AUDIT_LOGS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditEntry {
    @Id
    private String hash;
    private String action;
    @jakarta.persistence.Column(name = "AUDIT_USER")
    private String user;
    @jakarta.persistence.Column(name = "AUDIT_DATE")
    private String date;
    private String status;
}
