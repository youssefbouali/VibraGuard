package com.vibraguard.bi.entity;

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
public class MotorEntity {
    @Id
    private String id;
    private String site;
    private String localisation;
}
