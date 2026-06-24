package com.vibraguard.motor.repository;

import com.vibraguard.motor.entity.VibrationData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VibrationRepository extends MongoRepository<VibrationData, String> {
    List<VibrationData> findByMotorId(String motorId);
    List<VibrationData> findTop1000ByOrderByTimeDesc();
    void deleteByMotorId(String motorId);
}
