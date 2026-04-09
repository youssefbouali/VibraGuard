import hre from "hardhat";
import fs from "fs";

async function main() {
  const WorkOrderRegistry = await hre.ethers.deployContract("WorkOrderRegistry");

  await WorkOrderRegistry.waitForDeployment();
  const address = await WorkOrderRegistry.getAddress();

  console.log(`WorkOrderRegistry deployed to ${address}`);

  // Create contract data structure for frontend
  const data = {
    address: address,
    abi: JSON.parse(fs.readFileSync('./artifacts/contracts/WorkOrderRegistry.sol/WorkOrderRegistry.json')).abi
  };

  // Write directly into frontend directory
  fs.writeFileSync("../frontend/client/lib/WorkOrderRegistry.json", JSON.stringify(data, null, 2));
  console.log("Contract info exported to frontend!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
