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
    private int value;
    private String color;

    public Intervention() {}
    public Intervention(String type, int value, String color) {
        this.type = type;
        this.value = value;
        this.color = color;
    }

    public String getType() { return type; }
    public void setType(String t) { this.type = t; }
    public int getValue() { return value; }
    public void setValue(int v) { this.value = v; }
    public String getColor() { return color; }
    public void setColor(String c) { this.color = c; }
}
