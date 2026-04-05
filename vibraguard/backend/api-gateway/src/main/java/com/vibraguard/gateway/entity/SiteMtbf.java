package com.vibraguard.gateway.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "SITE_MTBF")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SiteMtbf {
    @Id
    private String name;
    private int value;
    private String color;

    public SiteMtbf() {}
    public SiteMtbf(String name, int value, String color) {
        this.name = name;
        this.value = value;
        this.color = color;
    }

    public String getName() { return name; }
    public void setName(String n) { this.name = n; }
    public int getValue() { return value; }
    public void setValue(int v) { this.value = v; }
    public String getColor() { return color; }
    public void setColor(String c) { this.color = c; }
}
