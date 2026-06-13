package com.vibraguard.gateway.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "INTERVENTIONS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Intervention {
    @Id
    @jakarta.persistence.Column(name = "INTER_TYPE")
    private String type;

    @jakarta.persistence.Column(name = "INTERVENTION_VALUE")
    private int value;

    private String color;
}
