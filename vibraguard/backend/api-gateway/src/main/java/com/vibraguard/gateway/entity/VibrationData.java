package com.vibraguard.gateway.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "VIBRATION_DATA")
public class VibrationData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @jakarta.persistence.Column(name = "MOTOR_ID")
    private String motorId;
    @jakarta.persistence.Column(name = "VIBRATION_TIME")
    private String time;
    private double x;
    private double y;
    private double z;

    public VibrationData() {}

    public VibrationData(Long id, String motorId, String time, double x, double y, double z) {
        this.id = id;
        this.motorId = motorId;
        this.time = time;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMotorId() { return motorId; }
    public void setMotorId(String motorId) { this.motorId = motorId; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public double getX() { return x; }
    public void setX(double x) { this.x = x; }
    public double getY() { return y; }
    public void setY(double y) { this.y = y; }
    public double getZ() { return z; }
    public void setZ(double z) { this.z = z; }
}
