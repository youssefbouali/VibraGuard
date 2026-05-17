// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract WorkOrderRegistry {
    address public owner;

    struct WorkOrder {
        string id;
        string workType;
        string description;
        string status;
        address creator;
        uint timestamp;
    }

    mapping(string => WorkOrder) public workOrders;
    mapping(string => string[]) public workOrderHistories;
    string[] public workOrderIds;

    event WorkOrderCreated(
        string indexed id,
        string workType,
        string description,
        address creator,
        uint timestamp
    );

    event WorkOrderStatusUpdated(
        string indexed id,
        string oldStatus,
        string newStatus,
        address updater,
        uint timestamp
    );

    constructor() {
        owner = msg.sender;
    }

    function createWorkOrder(
        string memory _id,
        string memory _workType,
        string memory _description
    ) public {
        workOrders[_id] = WorkOrder({
            id: _id,
            workType: _workType,
            description: _description,
            status: "CREATED",
            creator: msg.sender,
            timestamp: block.timestamp
        });
        workOrderIds.push(_id);
        workOrderHistories[_id].push("CREATED");

        emit WorkOrderCreated(_id, _workType, _description, msg.sender, block.timestamp);
    }

    function updateWorkOrderStatus(string memory _id, string memory _newStatus) public {
        string memory oldStatus = workOrders[_id].status;
        workOrders[_id].status = _newStatus;
        workOrderHistories[_id].push(_newStatus);

        emit WorkOrderStatusUpdated(_id, oldStatus, _newStatus, msg.sender, block.timestamp);
    }

    function getWorkOrder(string memory _id) public view returns (
        string memory id,
        string memory workType,
        string memory description,
        string memory status,
        address creator,
        uint timestamp
    ) {
        WorkOrder storage wo = workOrders[_id];
        return (wo.id, wo.workType, wo.description, wo.status, wo.creator, wo.timestamp);
    }

    function getWorkOrderHistory(string memory _id) public view returns (string[] memory) {
        return workOrderHistories[_id];
    }

    function getWorkOrderCount() public view returns (uint) {
        return workOrderIds.length;
    }
}
