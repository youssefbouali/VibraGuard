package com.vibraguard.gateway.repository;

import com.vibraguard.gateway.entity.KpiValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KpiValueRepository extends JpaRepository<KpiValue, String> {
}
