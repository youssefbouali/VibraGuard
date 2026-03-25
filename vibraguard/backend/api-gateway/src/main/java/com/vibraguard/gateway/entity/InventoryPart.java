package com.vibraguard.gateway.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "INVENTORY_PARTS")
public class InventoryPart {
    @Id
    private String id;
    private String name;
    private int stock;
    private String stockColor;

    public InventoryPart() {}

    public InventoryPart(String id, String name, int stock, String stockColor) {
        this.id = id;
        this.name = name;
        this.stock = stock;
        this.stockColor = stockColor;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
    public String getStockColor() { return stockColor; }
    public void setStockColor(String stockColor) { this.stockColor = stockColor; }
}
