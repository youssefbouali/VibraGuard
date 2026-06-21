package com.vibraguard.inventory.repository;

import com.vibraguard.inventory.entity.InventoryPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryPartRepository extends JpaRepository<InventoryPart, String> {
}
