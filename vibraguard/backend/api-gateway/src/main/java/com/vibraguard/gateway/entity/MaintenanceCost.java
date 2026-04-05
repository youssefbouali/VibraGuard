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
@Table(name = "MAINTENANCE_COSTS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceCost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String month;
    private double reel;
    private double budget;

    public MaintenanceCost() {}
    public MaintenanceCost(Long id, String month, double reel, double budget) {
        this.id = id;
        this.month = month;
        this.reel = reel;
        this.budget = budget;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMonth() { return month; }
    public void setMonth(String m) { this.month = m; }
    public double getReel() { return reel; }
    public void setReel(double r) { this.reel = r; }
    public double getBudget() { return budget; }
    public void setBudget(double b) { this.budget = b; }
}
