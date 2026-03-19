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
    private String status; // done, active, pending
    private String borderColor;
    private String bgColor;
    private String sublabelColor;
    private String iconType; // alert, order, intervention, contract, block
}
