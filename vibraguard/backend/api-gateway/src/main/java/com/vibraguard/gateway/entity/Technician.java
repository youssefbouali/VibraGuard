package com.vibraguard.gateway.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "TECHNICIANS")
public class Technician {
    @Id
    private String id;
    private String name;
    private String specialization;
    private String avatarUrl;

    public Technician() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String n) { this.name = n; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String s) { this.specialization = s; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String a) { this.avatarUrl = a; }
}
