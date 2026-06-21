package com.vibraguard.workorder.repository;

import com.vibraguard.workorder.entity.Intervention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterventionRepository extends JpaRepository<Intervention, String> {
}
