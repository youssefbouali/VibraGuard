import hre from "hardhat";
import fs from "fs";

/**
 * Import on-chain state from a JSON backup file into WorkOrderRegistry.
 * Usage:
 *   npx hardhat run scripts/import-backup.js --network localhost
 *
 * Set the backup file path via env var or edit BACKUP_FILE below:
 *   BACKUP_FILE=backups/blockchain-backup-2025-06-22_10-30-00.json \
 *     npx hardhat run scripts/import-backup.js --network localhost
 *
 * NOTE: This re-replays all createWorkOrder and storeReport transactions.
 *       Run against a fresh deployment to avoid duplicate-entry errors.
 */

// Change this or set env var BACKUP_FILE
const BACKUP_FILE = process.env.BACKUP_FILE || resolveLatestBackup();

function resolveLatestBackup() {
  if (!fs.existsSync("backups")) return null;
  const files = fs
    .readdirSync("backups")
    .filter((f) => f.startsWith("blockchain-backup-") && f.endsWith(".json"))
    .sort()
    .reverse();
  return files.length > 0 ? `backups/${files[0]}` : null;
}

async function main() {
  if (!BACKUP_FILE || !fs.existsSync(BACKUP_FILE)) {
    throw new Error(
      `Backup file not found: ${BACKUP_FILE}\n` +
        "Set BACKUP_FILE=<path> or run export-backup.js first."
    );
  }

  console.log("📥 Importing blockchain state...");
  console.log("   Network:     ", hre.network.name);
  console.log("   Backup file: ", BACKUP_FILE);

  const backup = JSON.parse(fs.readFileSync(BACKUP_FILE, "utf8"));

  console.log(`\n📊 Backup summary:`);
  console.log(`   Exported at:  ${backup.exportedAt}`);
  console.log(`   Work orders:  ${backup.summary.workOrderCount}`);
  console.log(`   Reports:      ${backup.summary.reportCount}`);

  // Load current deployment
  const deploymentPath = "./deployments/WorkOrderRegistry.json";
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(
      "Deployment file not found. Deploy the contract first: npm run deploy"
    );
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  console.log(`\n   Target contract: ${deployment.address}`);

  const contract = await hre.ethers.getContractAt(
    deployment.abi,
    deployment.address
  );

  const [signer] = await hre.ethers.getSigners();
  console.log(`   Signing as:      ${signer.address}\n`);

  // --- Import Work Orders ---
  let woImported = 0;
  let woSkipped = 0;

  if (backup.workOrders.length > 0) {
    console.log(`📋 Importing ${backup.workOrders.length} work order(s)...`);

    for (const wo of backup.workOrders) {
      // Check if already exists (workOrders mapping returns empty struct if not found)
      const existing = await contract.workOrders(wo.id);
      if (existing.id === wo.id) {
        console.log(`   ⏭  Skipped (exists): ${wo.id}`);
        woSkipped++;
        continue;
      }

      const tx = await contract.createWorkOrder(
        wo.id,
        wo.title,
        wo.asset,
        wo.priority
      );
      await tx.wait();
      console.log(`   ✅ Work order: ${wo.id}`);
      woImported++;
    }
  }

  // --- Import Reports ---
  let rImported = 0;
  let rSkipped = 0;

  if (backup.reports.length > 0) {
    console.log(`\n📄 Importing ${backup.reports.length} report(s)...`);

    for (const report of backup.reports) {
      // getReport reverts if not found, so check reportIds array instead
      const reportCount = await contract.getReportCount();
      let exists = false;
      for (let i = 0; i < reportCount; i++) {
        const existingId = await contract.reportIds(i);
        if (existingId === report.reportId) {
          exists = true;
          break;
        }
      }

      if (exists) {
        console.log(`   ⏭  Skipped (exists): ${report.reportId}`);
        rSkipped++;
        continue;
      }

      const tx = await contract.storeReport(report.reportId, report.ipfsCid);
      await tx.wait();
      console.log(`   ✅ Report: ${report.reportId}`);
      rImported++;
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(
    `   Work orders: ${woImported} imported, ${woSkipped} skipped (already existed)`
  );
  console.log(
    `   Reports:     ${rImported} imported, ${rSkipped} skipped (already existed)`
  );
}

main().catch((error) => {
  console.error("❌ Import failed:", error.message);
  process.exitCode = 1;
});
