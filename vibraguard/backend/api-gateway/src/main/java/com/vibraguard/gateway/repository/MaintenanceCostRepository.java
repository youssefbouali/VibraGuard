package com.vibraguard.gateway.repository;

import com.vibraguard.gateway.entity.MaintenanceCost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceCostRepository extends JpaRepository<MaintenanceCost, Long> {
}
