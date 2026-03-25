package com.vibraguard.gateway.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "AUDIT_LOGS")
public class AuditEntry {
    @Id
    private String hash;
    private String action;
    @jakarta.persistence.Column(name = "AUDIT_USER")
    private String user;
    @jakarta.persistence.Column(name = "AUDIT_DATE")
    private String date;
    private String status;

    public AuditEntry() {}

    public AuditEntry(String hash, String action, String user, String date, String status) {
        this.hash = hash;
        this.action = action;
        this.user = user;
        this.date = date;
        this.status = status;
    }

    public String getHash() { return hash; }
    public void setHash(String hash) { this.hash = hash; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
