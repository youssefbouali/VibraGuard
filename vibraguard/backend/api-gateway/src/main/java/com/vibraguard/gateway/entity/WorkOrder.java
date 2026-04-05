package com.vibraguard.gateway.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "WORK_ORDERS")
public class WorkOrder {
    @Id
    private String id;
    private String title;
    private String asset;
    @jakarta.persistence.Column(name = "WO_STATUS")
    private String status;
    private String assignedTo;
    private String dueDate;
    private String priority;

    public WorkOrder() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String t) { this.title = t; }
    public String getAsset() { return asset; }
    public void setAsset(String a) { this.asset = a; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String a) { this.assignedTo = a; }
    public String getDueDate() { return dueDate; }
    public void setDueDate(String d) { this.dueDate = d; }
    public String getPriority() { return priority; }
    public void setPriority(String p) { this.priority = p; }
}
