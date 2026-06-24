package com.vibraguard.motor.entity;

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
    private String derniereAlerteType;
    private String trendIcon;
    private String power;
    private String speed;
    private String localisation;
    private String site;
    private Boolean actif = true;
}
