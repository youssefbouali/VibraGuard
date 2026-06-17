import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("WorkOrderRegistry", function () {
  let workOrderRegistry;

  beforeEach(async function () {
    const WorkOrderRegistry = await ethers.getContractFactory("WorkOrderRegistry");
    workOrderRegistry = await WorkOrderRegistry.deploy();
    await workOrderRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(workOrderRegistry.target).to.not.equal(ethers.ZeroAddress);
    });
  });

  describe("Work Order Operations", function () {
    it("Should create a new work order", async function () {
      const tx = await workOrderRegistry.createWorkOrder(
        "WO-001",
        "Maintenance",
        "MOTOR-01",
        "high"
      );
      await tx.wait();

      const workOrder = await workOrderRegistry.workOrders("WO-001");
      expect(workOrder.id).to.equal("WO-001");
      expect(workOrder.title).to.equal("Maintenance");
      expect(workOrder.asset).to.equal("MOTOR-01");
      expect(workOrder.priority).to.equal("high");
    });

    it("Should increment work order count", async function () {
      await workOrderRegistry.createWorkOrder("WO-002", "Inspection", "MOTOR-02", "medium");
      expect(await workOrderRegistry.getWorkOrderCount()).to.equal(1n);
    });
  });

  describe("Report Storage", function () {
    it("Should store an IPFS CID for a report", async function () {
      await workOrderRegistry.storeReport("RPT-001", "bafy-report-cid");

      const report = await workOrderRegistry.getReport("RPT-001");
      expect(report.reportId).to.equal("RPT-001");
      expect(report.ipfsCid).to.equal("bafy-report-cid");
    });

    it("Should reject duplicate report IDs", async function () {
      await workOrderRegistry.storeReport("RPT-002", "bafy-first-cid");

      await expect(
        workOrderRegistry.storeReport("RPT-002", "bafy-second-cid")
      ).to.be.revertedWith("Report already stored");
    });
  });

  describe("Events", function () {
    it("Should emit WorkOrderCreated event", async function () {
      await expect(
        workOrderRegistry.createWorkOrder("WO-004", "Service", "MOTOR-04", "low")
      ).to.emit(workOrderRegistry, "WorkOrderCreated");
    });

    it("Should emit ReportStored event", async function () {
      await expect(
        workOrderRegistry.storeReport("RPT-003", "bafy-event-cid")
      ).to.emit(workOrderRegistry, "ReportStored");
    });
  });
});
