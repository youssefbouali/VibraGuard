package com.vibraguard.gateway.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "WORK_ORDERS")
@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
