package com.vibraguard.workorder.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "TECHNICIANS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Technician {
    @Id
    private String id;
    private String name;
    private String specialization;
    private String avatarUrl;
}
