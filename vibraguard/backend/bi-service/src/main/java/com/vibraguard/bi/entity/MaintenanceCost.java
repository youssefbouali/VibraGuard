package com.vibraguard.bi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "MAINTENANCE_COSTS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceCost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @jakarta.persistence.Column(name = "COST_MONTH")
    private String month;
    private double reel;
    private double budget;
}
