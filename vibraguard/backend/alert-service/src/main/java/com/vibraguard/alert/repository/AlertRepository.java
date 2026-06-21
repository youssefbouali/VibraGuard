package com.vibraguard.alert.repository;

import com.vibraguard.alert.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlertRepository extends JpaRepository<Alert, String> {
    @org.springframework.transaction.annotation.Transactional
    void deleteByMotorId(String motorId);
}
