package com.vibraguard.blockchain.repository;

import com.vibraguard.blockchain.entity.TraceabilityStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TraceabilityRepository extends JpaRepository<TraceabilityStep, Long> {
}
