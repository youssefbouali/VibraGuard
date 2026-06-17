import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Deploying WorkOrderRegistry...");
  console.log("   Network:", hre.network.name);

  const WorkOrderRegistry = await hre.ethers.deployContract("WorkOrderRegistry");
  await WorkOrderRegistry.waitForDeployment();
  const address = await WorkOrderRegistry.getAddress();

  console.log(`✅ WorkOrderRegistry deployed to ${address}`);

  // Create contract data structure for frontend
  const data = {
    address: address,
    abi: JSON.parse(fs.readFileSync('./artifacts/contracts/WorkOrderRegistry.sol/WorkOrderRegistry.json')).abi
  };

  // Write to deployment artifact file first (always)
  fs.mkdirSync('deployments', { recursive: true });
  fs.writeFileSync('deployments/WorkOrderRegistry.json', JSON.stringify(data, null, 2));
  console.log("📄 Saved deployment artifact to deployments/WorkOrderRegistry.json");

  // Also write to frontend if path is available
  const frontendPaths = [
    "../frontend/client/lib",
    "../../frontend/client/lib",
    process.env.FRONTEND_PATH && path.join(process.env.FRONTEND_PATH, "client/lib")
  ].filter(p => p);

  let written = false;
  for (const frontendPath of frontendPaths) {
    try {
      if (frontendPath && fs.existsSync(frontendPath)) {
        fs.writeFileSync(path.join(frontendPath, 'WorkOrderRegistry.json'), JSON.stringify(data, null, 2));
        console.log(`✅ Contract info exported to ${frontendPath}/WorkOrderRegistry.json`);
        written = true;
        break;
      }
    } catch (e) {
      console.warn(`⚠️  Could not write to ${frontendPath}:`, e.message);
    }
  }

  if (!written) {
    console.log("⚠️  Frontend path not found. Contract info saved only to deployments/WorkOrderRegistry.json");
    console.log("   To pass contract to frontend, set: FRONTEND_PATH=/path/to/frontend");
  }

  // Always output address for use in environment variables
  console.log("\n📌 Use this address in your environment:");
  console.log(`   VITE_WORKORDER_REGISTRY_ADDRESS=${address}`);
  console.log(`   BLOCKCHAIN_WORKORDER_REGISTRY_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
