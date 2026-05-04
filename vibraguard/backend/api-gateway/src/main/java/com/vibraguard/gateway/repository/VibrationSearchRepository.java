package com.vibraguard.gateway.repository;

import com.vibraguard.gateway.entity.VibrationSearchData;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VibrationSearchRepository extends ElasticsearchRepository<VibrationSearchData, String> {
}
