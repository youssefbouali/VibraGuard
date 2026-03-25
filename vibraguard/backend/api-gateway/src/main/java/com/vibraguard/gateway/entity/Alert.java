package com.vibraguard.gateway.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ALERTS")
public class Alert {
    @Id
    private String id;
    private String message;
    @jakarta.persistence.Column(name = "ALERT_LEVEL")
    private String level;
    @jakarta.persistence.Column(name = "ALERT_TIME")
    private String time;
    private String color;
    private String priority;
    private String status; // Nouveau, Acquittée, Escaladée

    public Alert() {}

    public Alert(String id, String message, String level, String time, String color, String priority, String status) {
        this.id = id;
        this.message = message;
        this.level = level;
        this.time = time;
        this.color = color;
        this.priority = priority;
        this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
