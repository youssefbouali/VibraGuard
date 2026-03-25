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

    public WorkOrder(String id, String title, String asset, String status, String assignedTo, String dueDate, String priority) {
        this.id = id;
        this.title = title;
        this.asset = asset;
        this.status = status;
        this.assignedTo = assignedTo;
        this.dueDate = dueDate;
        this.priority = priority;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAsset() { return asset; }
    public void setAsset(String asset) { this.asset = asset; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
