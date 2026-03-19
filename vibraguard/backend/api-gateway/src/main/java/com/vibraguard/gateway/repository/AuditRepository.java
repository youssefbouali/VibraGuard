package com.vibraguard.gateway.repository;

import com.vibraguard.gateway.entity.AuditEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditRepository extends JpaRepository<AuditEntry, String> {
}
