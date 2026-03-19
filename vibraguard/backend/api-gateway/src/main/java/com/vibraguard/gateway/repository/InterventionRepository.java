package com.vibraguard.gateway.repository;

import com.vibraguard.gateway.entity.Intervention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterventionRepository extends JpaRepository<Intervention, String> {
}
