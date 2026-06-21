package com.vibraguard.bi.repository;

import com.vibraguard.bi.entity.MaintenanceCost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceCostRepository extends JpaRepository<MaintenanceCost, Long> {
}
