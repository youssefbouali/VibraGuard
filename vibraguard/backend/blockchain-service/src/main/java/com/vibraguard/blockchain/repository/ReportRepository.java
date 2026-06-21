package com.vibraguard.blockchain.repository;

import com.vibraguard.blockchain.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {
    List<Report> findByCreatedByEmail(String email);
    List<Report> findByIsPublic(boolean isPublic);
}
