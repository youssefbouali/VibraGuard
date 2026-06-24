package com.vibraguard.bi.repository;

import com.vibraguard.bi.entity.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, String> {
    List<WorkOrder> findByType(String type);
    List<WorkOrder> findByAssetAndType(String asset, String type);
    List<WorkOrder> findByAssetInAndType(List<String> assets, String type);
}
