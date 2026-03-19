package com.vibraguard.gateway.repository;

import com.vibraguard.gateway.entity.Motor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MotorRepository extends JpaRepository<Motor, String> {
}
