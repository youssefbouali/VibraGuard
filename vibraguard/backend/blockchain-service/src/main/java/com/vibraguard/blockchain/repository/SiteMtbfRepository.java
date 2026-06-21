package com.vibraguard.blockchain.repository;

import com.vibraguard.blockchain.entity.SiteMtbf;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SiteMtbfRepository extends JpaRepository<SiteMtbf, String> {
}
