package com.vibraguard.gateway.repository;

import com.vibraguard.gateway.entity.TraceabilityStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TraceabilityRepository extends JpaRepository<TraceabilityStep, Long> {
}
