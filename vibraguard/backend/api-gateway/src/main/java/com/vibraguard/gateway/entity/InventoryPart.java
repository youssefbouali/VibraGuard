package com.vibraguard.gateway.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "INVENTORY_PARTS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryPart {
    @Id
    private String id;
    private String name;
    private int stock;
    private String stockColor;

    public InventoryPart() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String n) { this.name = n; }
    public int getStock() { return stock; }
    public void setStock(int s) { this.stock = s; }
    public String getStockColor() { return stockColor; }
    public void setStockColor(String s) { this.stockColor = s; }
}
