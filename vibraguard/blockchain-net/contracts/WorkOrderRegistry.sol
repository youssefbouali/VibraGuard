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

    struct ReportRecord {
        string reportId;
        string ipfsCid;
        address creator;
        uint timestamp;
    }

    mapping(string => WorkOrder) public workOrders;
    mapping(string => ReportRecord) private reports;
    string[] public workOrderIds;
    string[] public reportIds;

    event WorkOrderCreated(
        string indexed id,
        string title,
        string asset,
        string priority,
        address creator,
        uint timestamp
    );

    event ReportStored(
        string indexed reportId,
        string ipfsCid,
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

    function storeReport(string memory _reportId, string memory _ipfsCid) public {
        require(bytes(_reportId).length > 0, "Report ID is required");
        require(bytes(_ipfsCid).length > 0, "IPFS CID is required");
        require(reports[_reportId].creator == address(0), "Report already stored");

        reports[_reportId] = ReportRecord({
            reportId: _reportId,
            ipfsCid: _ipfsCid,
            creator: msg.sender,
            timestamp: block.timestamp
        });
        reportIds.push(_reportId);

        emit ReportStored(_reportId, _ipfsCid, msg.sender, block.timestamp);
    }

    function getWorkOrderCount() public view returns (uint) {
        return workOrderIds.length;
    }

    function getReport(string memory _reportId) public view returns (ReportRecord memory) {
        require(reports[_reportId].creator != address(0), "Report not found");
        return reports[_reportId];
    }

    function getReportCount() public view returns (uint) {
        return reportIds.length;
    }
}
