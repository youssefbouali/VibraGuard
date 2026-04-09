const hre = require("hardhat");
const fs = require("fs");

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

  // Write directly into frontend directory if it exists (local dev), otherwise skip
  const frontendPath = "../frontend/client/lib";
  if (fs.existsSync(frontendPath)) {
    fs.writeFileSync(`${frontendPath}/WorkOrderRegistry.json`, JSON.stringify(data, null, 2));
    console.log("Contract info exported to frontend!");
  } else {
    console.log("Running in isolated container. Artifact not exported to filesystem.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
