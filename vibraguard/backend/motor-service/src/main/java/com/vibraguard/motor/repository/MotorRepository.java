package com.vibraguard.motor.repository;

import com.vibraguard.motor.entity.Motor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MotorRepository extends JpaRepository<Motor, String> {
}
