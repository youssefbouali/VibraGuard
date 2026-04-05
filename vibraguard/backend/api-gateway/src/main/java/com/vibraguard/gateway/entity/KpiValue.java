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
    public void setNumericValue(Double v) { this.numericValue = v; }
    public String getStringValue() { return stringValue; }
    public void setStringValue(String s) { this.stringValue = s; }
    public String getTrend() { return trend; }
    public void setTrend(String t) { this.trend = t; }
    public Boolean getTrendUp() { return trendUp; }
    public void setTrendUp(Boolean b) { this.trendUp = b; }
}
