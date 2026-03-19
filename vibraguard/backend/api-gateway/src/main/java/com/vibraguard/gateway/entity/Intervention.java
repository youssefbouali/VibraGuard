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
    private String type;
    private int value;
    private String color;
}
