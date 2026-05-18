import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("WorkOrderRegistry", function () {
  let workOrderRegistry;
  let owner;
  let addr1;

  beforeEach(async function () {
    const WorkOrderRegistry = await ethers.getContractFactory("WorkOrderRegistry");
    workOrderRegistry = await WorkOrderRegistry.deploy();
    await workOrderRegistry.waitForDeployment();

    [owner, addr1] = await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(workOrderRegistry.target).to.not.equal(ethers.ZeroAddress);
    });

    it("Should set the right owner", async function () {
      expect(await workOrderRegistry.owner()).to.equal(owner.address);
    });
  });

  describe("Work Order Operations", function () {
    it("Should create a new work order", async function () {
      const tx = await workOrderRegistry.createWorkOrder(
        "WO-001",
        "Maintenance",
        "Engine maintenance"
      );
      await tx.wait();

      const workOrder = await workOrderRegistry.getWorkOrder("WO-001");
      expect(workOrder.id).to.equal("WO-001");
      expect(workOrder.status).to.equal("CREATED");
    });

    it("Should update work order status", async function () {
      await workOrderRegistry.createWorkOrder(
        "WO-002",
        "Inspection",
        "Vibration inspection"
      );

      const tx = await workOrderRegistry.updateWorkOrderStatus("WO-002", "IN_PROGRESS");
      await tx.wait();

      const workOrder = await workOrderRegistry.getWorkOrder("WO-002");
      expect(workOrder.status).to.equal("IN_PROGRESS");
    });

    it("Should track work order history", async function () {
      await workOrderRegistry.createWorkOrder(
        "WO-003",
        "Repair",
        "Bearing replacement"
      );

      const history = await workOrderRegistry.getWorkOrderHistory("WO-003");
      expect(history.length).to.be.greaterThan(0);
    });
  });

  describe("Events", function () {
    it("Should emit WorkOrderCreated event", async function () {
      await expect(
        workOrderRegistry.createWorkOrder("WO-004", "Service", "Regular service")
      ).to.emit(workOrderRegistry, "WorkOrderCreated");
    });

    it("Should emit WorkOrderStatusUpdated event", async function () {
      await workOrderRegistry.createWorkOrder("WO-005", "Service", "Regular service");
      
      await expect(
        workOrderRegistry.updateWorkOrderStatus("WO-005", "COMPLETED")
      ).to.emit(workOrderRegistry, "WorkOrderStatusUpdated");
    });
  });
});
