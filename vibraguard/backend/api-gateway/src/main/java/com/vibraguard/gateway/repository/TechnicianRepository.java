package com.vibraguard.gateway.repository;

import com.vibraguard.gateway.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TechnicianRepository extends JpaRepository<Technician, String> {
}
