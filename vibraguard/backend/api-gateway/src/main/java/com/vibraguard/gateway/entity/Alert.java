package com.vibraguard.gateway.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ALERTS")
@Data
@NoArgsConstructor
@AllArgsConstructor
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
    private String motorId;
    private String title;
    private Double velociteRms;
    private Double accelerationPeak;
    private Double temperature;
    private Double scoreConfianceIA;
    private Double depassementSeuil;

    public Alert() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getMessage() { return message; }
    public void setMessage(String m) { this.message = m; }
    public String getLevel() { return level; }
    public void setLevel(String l) { this.level = l; }
    public String getTime() { return time; }
    public void setTime(String t) { this.time = t; }
    public String getColor() { return color; }
    public void setColor(String c) { this.color = c; }
    public String getPriority() { return priority; }
    public void setPriority(String p) { this.priority = p; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public String getMotorId() { return motorId; }
    public void setMotorId(String m) { this.motorId = m; }
    public String getTitle() { return title; }
    public void setTitle(String t) { this.title = t; }
    public Double getVelociteRms() { return velociteRms; }
    public void setVelociteRms(Double v) { this.velociteRms = v; }
    public Double getAccelerationPeak() { return accelerationPeak; }
    public void setAccelerationPeak(Double a) { this.accelerationPeak = a; }
    public Double getTemperature() { return temperature; }
    public void setTemperature(Double t) { this.temperature = t; }
    public Double getScoreConfianceIA() { return scoreConfianceIA; }
    public void setScoreConfianceIA(Double s) { this.scoreConfianceIA = s; }
    public Double getDepassementSeuil() { return depassementSeuil; }
    public void setDepassementSeuil(Double d) { this.depassementSeuil = d; }
}
