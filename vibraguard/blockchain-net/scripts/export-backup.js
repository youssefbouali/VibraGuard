import hre from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Export on-chain state from WorkOrderRegistry to a JSON backup file.
 * Usage:
 *   npx hardhat run scripts/export-backup.js --network localhost
 *
 * The backup file is saved to: backups/blockchain-backup-<timestamp>.json
 */
async function main() {
  console.log("📦 Exporting blockchain state...");
  console.log("   Network:", hre.network.name);

  // Load deployment info
  const deploymentPath = "./deployments/WorkOrderRegistry.json";
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(
      "Deployment file not found. Run deploy first: npm run deploy"
    );
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  console.log("   Contract address:", deployment.address);

  // Connect to the deployed contract
  const contract = await hre.ethers.getContractAt(
    deployment.abi,
    deployment.address
  );

  // --- Export Work Orders ---
  const workOrderCount = await contract.getWorkOrderCount();
  console.log(`\n📋 Exporting ${workOrderCount} work order(s)...`);

  const workOrders = [];
  for (let i = 0; i < workOrderCount; i++) {
    const id = await contract.workOrderIds(i);
    const wo = await contract.workOrders(id);
    workOrders.push({
      id: wo.id,
      title: wo.title,
      asset: wo.asset,
      priority: wo.priority,
      creator: wo.creator,
      timestamp: wo.timestamp.toString(),
    });
    process.stdout.write(`   [${i + 1}/${workOrderCount}] ${wo.id}\r`);
  }
  if (workOrderCount > 0) console.log();

  // --- Export Reports ---
  const reportCount = await contract.getReportCount();
  console.log(`📄 Exporting ${reportCount} report(s)...`);

  const reports = [];
  for (let i = 0; i < reportCount; i++) {
    const reportId = await contract.reportIds(i);
    const report = await contract.getReport(reportId);
    reports.push({
      reportId: report.reportId,
      ipfsCid: report.ipfsCid,
      creator: report.creator,
      timestamp: report.timestamp.toString(),
    });
    process.stdout.write(`   [${i + 1}/${reportCount}] ${report.reportId}\r`);
  }
  if (reportCount > 0) console.log();

  // --- Build backup object ---
  const backup = {
    exportedAt: new Date().toISOString(),
    network: hre.network.name,
    contractAddress: deployment.address,
    contractAbi: deployment.abi,
    summary: {
      workOrderCount: Number(workOrderCount),
      reportCount: Number(reportCount),
    },
    workOrders,
    reports,
  };

  // --- Save to file ---
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);
  fs.mkdirSync("backups", { recursive: true });
  const backupFile = `backups/blockchain-backup-${timestamp}.json`;
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

  console.log(`\n✅ Backup complete!`);
  console.log(`   Work orders: ${Number(workOrderCount)}`);
  console.log(`   Reports:     ${Number(reportCount)}`);
  console.log(`   Saved to:    ${backupFile}`);
}

main().catch((error) => {
  console.error("❌ Export failed:", error.message);
  process.exitCode = 1;
});
