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
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VibrationData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @jakarta.persistence.Column(name = "VIBRATION_TIME")
    private String time;
    private double x;
    private double y;
    private double z;
}
