package com.vibraguard.bi.repository;

import com.vibraguard.bi.entity.MotorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MotorRepository extends JpaRepository<MotorEntity, String> {
}
