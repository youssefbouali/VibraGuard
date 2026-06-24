package com.vibraguard.bi.entity;

import jakarta.persistence.Column;
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
    private String asset;
    @Column(name = "WO_TYPE")
    private String type;
    private String duration;
    private String dueDate;
    private String createdAt;
    private String completedAt;
    @Column(name = "WO_STATUS")
    private String status;
    private double cost;
}
