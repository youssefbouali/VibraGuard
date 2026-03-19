package com.vibraguard.gateway.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "KPI_VALUES")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KpiValue {
    @Id
    private String id;
    private Double numericValue;
    private String stringValue;
    private String trend;
    private Boolean trendUp;
}
