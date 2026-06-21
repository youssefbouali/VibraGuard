package com.vibraguard.inventory.entity;

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
}
