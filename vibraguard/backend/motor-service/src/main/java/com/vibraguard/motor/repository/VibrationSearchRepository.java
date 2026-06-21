package com.vibraguard.motor.repository;

import com.vibraguard.motor.entity.VibrationSearchData;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VibrationSearchRepository extends ElasticsearchRepository<VibrationSearchData, String> {
}
