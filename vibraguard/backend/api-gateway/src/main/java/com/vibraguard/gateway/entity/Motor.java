package com.vibraguard.gateway.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "MOTORS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Motor {
    @Id
    private String id;
    @jakarta.persistence.Column(name = "MOTOR_TYPE")
    private String type;
    private String etatLabel;
    private String etatColor;
    private int etatPct;
    private String vibration;
    private String vibrationColor;
    private String trendIcon;
    private int rul;
    private String rulTrend;
    private String power;
    private String speed;

    public Motor() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getEtatLabel() { return etatLabel; }
    public void setEtatLabel(String e) { this.etatLabel = e; }
    public String getEtatColor() { return etatColor; }
    public void setEtatColor(String e) { this.etatColor = e; }
    public int getEtatPct() { return etatPct; }
    public void setEtatPct(int e) { this.etatPct = e; }
    public String getVibration() { return vibration; }
    public void setVibration(String v) { this.vibration = v; }
    public String getVibrationColor() { return vibrationColor; }
    public void setVibrationColor(String v) { this.vibrationColor = v; }
    public String getTrendIcon() { return trendIcon; }
    public void setTrendIcon(String t) { this.trendIcon = t; }
    public int getRul() { return rul; }
    public void setRul(int r) { this.rul = r; }
    public String getRulTrend() { return rulTrend; }
    public void setRulTrend(String r) { this.rulTrend = r; }
    public String getPower() { return power; }
    public void setPower(String p) { this.power = p; }
    public String getSpeed() { return speed; }
    public void setSpeed(String s) { this.speed = s; }
}
