package com.vibraguard.gateway.repository;

import com.vibraguard.gateway.entity.VibrationData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VibrationRepository extends JpaRepository<VibrationData, Long> {
    List<VibrationData> findByMotorId(String motorId);
}
