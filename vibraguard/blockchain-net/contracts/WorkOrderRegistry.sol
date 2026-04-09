// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract WorkOrderRegistry {
    struct WorkOrder {
        string id;
        string title;
        string asset;
        string priority;
        address creator;
        uint timestamp;
    }

    mapping(string => WorkOrder) public workOrders;
    string[] public workOrderIds;

    event WorkOrderCreated(
        string indexed id,
        string title,
        string asset,
        string priority,
        address creator,
        uint timestamp
    );

    function createWorkOrder(
        string memory _id,
        string memory _title,
        string memory _asset,
        string memory _priority
    ) public {
        workOrders[_id] = WorkOrder({
            id: _id,
            title: _title,
            asset: _asset,
            priority: _priority,
            creator: msg.sender,
            timestamp: block.timestamp
        });
        workOrderIds.push(_id);
        
        emit WorkOrderCreated(_id, _title, _asset, _priority, msg.sender, block.timestamp);
    }

    function getWorkOrderCount() public view returns (uint) {
        return workOrderIds.length;
    }
}
