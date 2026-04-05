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

    public String getHash() { return hash; }
    public void setHash(String h) { this.hash = h; }
    public String getAction() { return action; }
    public void setAction(String a) { this.action = a; }
    public String getUser() { return user; }
    public void setUser(String u) { this.user = u; }
    public String getDate() { return date; }
    public void setDate(String d) { this.date = d; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
}
