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
}
