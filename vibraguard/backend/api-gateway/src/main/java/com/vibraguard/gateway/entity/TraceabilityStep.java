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

    public TraceabilityStep(Long id, String label, String sublabel, String status, String borderColor, String bgColor, String sublabelColor, String iconType) {
        this.id = id;
        this.label = label;
        this.sublabel = sublabel;
        this.status = status;
        this.borderColor = borderColor;
        this.bgColor = bgColor;
        this.sublabelColor = sublabelColor;
        this.iconType = iconType;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getSublabel() { return sublabel; }
    public void setSublabel(String sublabel) { this.sublabel = sublabel; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getBorderColor() { return borderColor; }
    public void setBorderColor(String borderColor) { this.borderColor = borderColor; }
    public String getBgColor() { return bgColor; }
    public void setBgColor(String bgColor) { this.bgColor = bgColor; }
    public String getSublabelColor() { return sublabelColor; }
    public void setSublabelColor(String sublabelColor) { this.sublabelColor = sublabelColor; }
    public String getIconType() { return iconType; }
    public void setIconType(String iconType) { this.iconType = iconType; }
}
