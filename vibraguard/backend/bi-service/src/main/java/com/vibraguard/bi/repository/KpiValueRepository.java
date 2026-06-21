package com.vibraguard.bi.repository;

import com.vibraguard.bi.entity.KpiValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KpiValueRepository extends JpaRepository<KpiValue, String> {
}
