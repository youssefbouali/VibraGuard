package com.vibraguard.blockchain.repository;

import com.vibraguard.blockchain.entity.AuditEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditRepository extends JpaRepository<AuditEntry, String> {
}
