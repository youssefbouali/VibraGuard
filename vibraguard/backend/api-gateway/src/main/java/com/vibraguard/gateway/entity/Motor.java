package com.vibraguard.gateway.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "MOTORS")
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

    public Motor() {}

    public Motor(String id, String type, String etatLabel, String etatColor, int etatPct, String vibration, String vibrationColor, String trendIcon) {
        this.id = id;
        this.type = type;
        this.etatLabel = etatLabel;
        this.etatColor = etatColor;
        this.etatPct = etatPct;
        this.vibration = vibration;
        this.vibrationColor = vibrationColor;
        this.trendIcon = trendIcon;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getEtatLabel() { return etatLabel; }
    public void setEtatLabel(String etatLabel) { this.etatLabel = etatLabel; }
    public String getEtatColor() { return etatColor; }
    public void setEtatColor(String etatColor) { this.etatColor = etatColor; }
    public int getEtatPct() { return etatPct; }
    public void setEtatPct(int etatPct) { this.etatPct = etatPct; }
    public String getVibration() { return vibration; }
    public void setVibration(String vibration) { this.vibration = vibration; }
    public String getVibrationColor() { return vibrationColor; }
    public void setVibrationColor(String vibrationColor) { this.vibrationColor = vibrationColor; }
    public String getTrendIcon() { return trendIcon; }
    public void setTrendIcon(String trendIcon) { this.trendIcon = trendIcon; }
}
