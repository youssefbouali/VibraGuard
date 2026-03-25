package com.vibraguard.gateway.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "KPI_VALUES")
public class KpiValue {
    @Id
    private String id;
    private Double numericValue;
    private String stringValue;
    private String trend;
    private Boolean trendUp;

    public KpiValue() {}

    public KpiValue(String id, Double numericValue, String stringValue, String trend, Boolean trendUp) {
        this.id = id;
        this.numericValue = numericValue;
        this.stringValue = stringValue;
        this.trend = trend;
        this.trendUp = trendUp;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Double getNumericValue() { return numericValue; }
    public void setNumericValue(Double numericValue) { this.numericValue = numericValue; }
    public String getStringValue() { return stringValue; }
    public void setStringValue(String stringValue) { this.stringValue = stringValue; }
    public String getTrend() { return trend; }
    public void setTrend(String trend) { this.trend = trend; }
    public Boolean getTrendUp() { return trendUp; }
    public void setTrendUp(Boolean trendUp) { this.trendUp = trendUp; }
}
