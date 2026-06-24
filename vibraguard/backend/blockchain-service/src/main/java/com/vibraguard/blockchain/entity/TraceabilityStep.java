package com.vibraguard.blockchain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "TRACEABILITY_STEPS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TraceabilityStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String label;
    private String sublabel;
    @jakarta.persistence.Column(name = "STEP_STATUS")
    private String status;
    private String borderColor;
    private String bgColor;
    private String sublabelColor;
    private String iconType;
}
