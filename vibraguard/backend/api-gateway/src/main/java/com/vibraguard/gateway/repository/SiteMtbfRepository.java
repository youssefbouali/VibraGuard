package com.vibraguard.gateway.repository;

import com.vibraguard.gateway.entity.SiteMtbf;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SiteMtbfRepository extends JpaRepository<SiteMtbf, String> {
}
