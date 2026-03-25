package com.vibraguard.gateway.repository;

import com.vibraguard.gateway.entity.InventoryPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryPartRepository extends JpaRepository<InventoryPart, String> {
}
