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
    @jakarta.persistence.Column(name = "STEP_STATUS")
    private String status; // done, active, pending
    private String borderColor;
    private String bgColor;
    private String sublabelColor;
    private String iconType; // alert, order, intervention, contract, block

    public TraceabilityStep() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getLabel() { return label; }
    public void setLabel(String l) { this.label = l; }
    public String getSublabel() { return sublabel; }
    public void setSublabel(String s) { this.sublabel = s; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public String getBorderColor() { return borderColor; }
    public void setBorderColor(String b) { this.borderColor = b; }
    public String getBgColor() { return bgColor; }
    public void setBgColor(String b) { this.bgColor = b; }
    public String getSublabelColor() { return sublabelColor; }
    public void setSublabelColor(String s) { this.sublabelColor = s; }
    public String getIconType() { return iconType; }
    public void setIconType(String i) { this.iconType = i; }
}
