import { ethers } from "ethers";

// Fallback ABI in case the deployment script hasn't generated the JSON yet
const DEFAULT_ABI = [
  "function createWorkOrder(string memory _id, string memory _title, string memory _asset, string memory _priority) public",
  "function storeReport(string memory _reportId, string memory _ipfsCid) public",
  "function getReport(string memory _reportId) public view returns ((string reportId,string ipfsCid,address creator,uint256 timestamp))",
  "function getReportCount() public view returns (uint)",
  "function getWorkOrderCount() public view returns (uint)",
  "event ReportStored(string indexed reportId, string ipfsCid, address creator, uint timestamp)",
  "event WorkOrderCreated(string indexed id, string title, string asset, string priority, address creator, uint timestamp)"
];

const DEFAULT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Typical first hardhat address

// Cache for contract data to ensure both functions use the same address
let contractDataCache: { address: string; abi: any[] } | null = null;

/**
 * Try to find the actual deployed contract address by looking for code at known addresses
 */
async function discoverContractAddress(provider: ethers.Provider): Promise<string | null> {
  console.log("🔎 Attempting to discover contract address...");
  
  // Try a few common Hardhat deployment addresses in order
  const candidateAddresses = [
    "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Most common first deployment
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",  // Second common address
    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",  // Third common address
  ];

  for (const addr of candidateAddresses) {
    try {
      const code = await provider.getCode(addr);
      if (code && code !== "0x") {
        console.log("✅ Found contract code at:", addr);
        return addr;
      }
    } catch (e) {
      console.log("⚠️ Error checking address", addr, e);
    }
  }
  
  console.warn("⚠️ Could not discover contract address");
  return null;
}

async function getContractData() {
  // Return cached data if available
  if (contractDataCache) {
    console.log("📦 Using cached contract address:", contractDataCache.address);
    return contractDataCache;
  }

  const providerUrl = typeof window !== 'undefined' ? `${window.location.origin}/blockchain-rpc` : "http://127.0.0.1:8545";
  const provider = new ethers.JsonRpcProvider(providerUrl);

  let contractData = { address: DEFAULT_ADDRESS, abi: DEFAULT_ABI };

  const envAddress = typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined' && import.meta.env.VITE_WORKORDER_REGISTRY_ADDRESS
    ? String(import.meta.env.VITE_WORKORDER_REGISTRY_ADDRESS).trim()
    : "";

  async function addressHasCode(address: string) {
    try {
      const code = await provider.getCode(address);
      return code && code !== "0x";
    } catch (e) {
      console.warn("⚠️ Failed to read code for address", address, e);
      return false;
    }
  }

  // Try env override first if available
  if (envAddress) {
    console.log("📥 Found contract address in VITE_WORKORDER_REGISTRY_ADDRESS:", envAddress);
    if (await addressHasCode(envAddress)) {
      contractData.address = envAddress;
      console.log("✅ Env contract address is valid");
    } else {
      console.warn("⚠️ Env contract address has no code:", envAddress);
    }
  }

  // Try localStorage next if available
  if (contractData.address === DEFAULT_ADDRESS && typeof window !== 'undefined') {
    try {
      const storedAddress = localStorage.getItem('workOrderRegistryAddress');
      if (storedAddress) {
        console.log("📥 Found contract address in localStorage:", storedAddress);
        if (await addressHasCode(storedAddress)) {
          contractData.address = storedAddress;
          console.log("✅ localStorage address is valid");
        } else {
          console.warn("⚠️ localStorage address has no contract code:", storedAddress);
        }
      }
    } catch (e) {
      console.warn("⚠️ Could not read contract address from localStorage", e);
    }
  }

  // Try to load from WorkOrderRegistry.json if localStorage did not yield a valid contract
  if (contractData.address === DEFAULT_ADDRESS || contractData.address === null) {
    try {
      const dynamicData = await import("./WorkOrderRegistry.json");
      if (dynamicData.address) {
        console.log("🔍 Loaded contract address from WorkOrderRegistry.json:", dynamicData.address);
        if (await addressHasCode(dynamicData.address)) {
          contractData = dynamicData as any;
          console.log("✅ JSON contract address is valid");
        } else {
          console.warn("⚠️ JSON contract address has no code:", dynamicData.address);
        }
      }
    } catch (e) {
      console.log("⚠️ WorkOrderRegistry.json not found or invalid, attempting discovery...");
    }
  }

  // If address still invalid, try discovery on known deployment addresses
  if (!(await addressHasCode(contractData.address))) {
    try {
      const discoveredAddress = await discoverContractAddress(provider);
      if (discoveredAddress) {
        contractData.address = discoveredAddress;
        console.log("✅ Discovered valid deployed contract address:", discoveredAddress);
      } else {
        console.warn("⚠️ No deployed contract found at known addresses. Using fallback address:", DEFAULT_ADDRESS);
      }
    } catch (discoveryError) {
      console.warn("⚠️ Discovery failed, using fallback address:", DEFAULT_ADDRESS, discoveryError);
    }
  }

  // Cache it for consistent use across the session
  contractDataCache = contractData;

  // Also save to localStorage for persistence across page reloads
  if (typeof window !== 'undefined') {
    try {
      if (await addressHasCode(contractData.address)) {
        localStorage.setItem('workOrderRegistryAddress', contractData.address);
        console.log("💾 Saved contract address to localStorage:", contractData.address);
      } else {
        console.warn("⚠️ Not saving invalid contract address to localStorage:", contractData.address);
      }
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }

  return contractData;
}

export interface BlockchainReportRecord {
  reportId: string;
  ipfsCid: string;
  creator: string;
  timestamp: number;
}

export interface ReportIntegrityResult {
  ok: boolean;
  reason: string;
  reportId: string;
  expectedCid: string;
  onChainCid?: string;
  expectedTxHash?: string | null;
  txHashReachable?: boolean;
  blockchainRecord?: BlockchainReportRecord | null;
}

export async function fetchReportRecordFromBlockchain(reportId: string): Promise<BlockchainReportRecord | null> {
  try {
    const contractData = await getContractData();
    const providerUrl = typeof window !== 'undefined' ? `${window.location.origin}/blockchain-rpc` : "http://127.0.0.1:8545";
    const provider = new ethers.JsonRpcProvider(providerUrl);

    const addressCode = await provider.getCode(contractData.address);
    if (!addressCode || addressCode === "0x") {
      throw new Error(`No deployed contract found at ${contractData.address}.`);
    }

    const contract = new ethers.Contract(contractData.address, contractData.abi, provider);
    const record = await contract.getReport(reportId);

    return {
      reportId: record.reportId?.toString?.() ?? record[0]?.toString?.() ?? reportId,
      ipfsCid: record.ipfsCid?.toString?.() ?? record[1]?.toString?.() ?? "",
      creator: record.creator?.toString?.() ?? record[2]?.toString?.() ?? "",
      timestamp: Number(record.timestamp ?? record[3] ?? 0),
    };
  } catch (error) {
    console.error("❌ Report blockchain fetch error:", error);
    return null;
  }
}

export async function verifyReportIntegrity(
  reportId: string,
  expectedCid: string,
  expectedTxHash?: string | null,
): Promise<ReportIntegrityResult> {
  try {
    const contractData = await getContractData();
    const providerUrl = typeof window !== 'undefined' ? `${window.location.origin}/blockchain-rpc` : "http://127.0.0.1:8545";
    const provider = new ethers.JsonRpcProvider(providerUrl);

    const blockchainRecord = await fetchReportRecordFromBlockchain(reportId);
    if (!blockchainRecord) {
      return {
        ok: false,
        reason: "No blockchain record found for this report.",
        reportId,
        expectedCid,
        expectedTxHash,
        blockchainRecord: null,
      };
    }

    let txHashReachable = false;
    if (expectedTxHash) {
      const receipt = await provider.getTransactionReceipt(expectedTxHash);
      txHashReachable = !!receipt && receipt.to?.toLowerCase() === contractData.address.toLowerCase();
    }

    const ok = blockchainRecord.ipfsCid === expectedCid && (!expectedTxHash || txHashReachable);

    return {
      ok,
      reason: ok
        ? "The IPFS CID matches the blockchain record."
        : blockchainRecord.ipfsCid !== expectedCid
          ? "The IPFS CID does not match the blockchain record."
          : "The blockchain transaction hash is missing or unreachable.",
      reportId,
      expectedCid,
      onChainCid: blockchainRecord.ipfsCid,
      expectedTxHash,
      txHashReachable,
      blockchainRecord,
    };
  } catch (error) {
    console.error("❌ Report integrity verification error:", error);
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Unknown verification error",
      reportId,
      expectedCid,
      expectedTxHash,
      blockchainRecord: null,
    };
  }
}

export async function submitWorkOrderToBlockchain(order: any) {
  try {
    let contractData = await getContractData();

    const providerUrl = typeof window !== 'undefined' ? `${window.location.origin}/blockchain-rpc` : "http://127.0.0.1:8545";
    const provider = new ethers.JsonRpcProvider(providerUrl);

    const addressCode = await provider.getCode(contractData.address);
    if (!addressCode || addressCode === "0x") {
      throw new Error(`No deployed contract found at ${contractData.address}. Please deploy WorkOrderRegistry or update WorkOrderRegistry.json.`);
    }
    
    // Use Hardhat account #0 private key (well-known test key, safe for local blockchain only)
    const HARDHAT_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const signer = new ethers.Wallet(HARDHAT_PRIVATE_KEY, provider);

    const contract = new ethers.Contract(contractData.address, contractData.abi, signer);

    console.log("📤 Submitting work order to blockchain...");
    console.log("📍 Contract address:", contractData.address);
    
    const tx = await contract.createWorkOrder(
      order.id || ("W-" + Math.floor(Math.random() * 10000)),
      order.title || "Sans titre",
      order.asset || "Inconnu",
      order.priority || "medium"
    );

    console.log("⏳ Waiting for transaction to be mined...");
    const receipt = await tx.wait();
    
    console.log("✅ Mined to blockchain!");
    console.log("   TX Hash:", receipt.hash);
    console.log("   Block:", receipt.blockNumber);
    console.log("   Contract Address:", contractData.address);
    console.log("   Receipt To:", receipt.to);
    console.log("   Receipt From:", receipt.from);
    console.log("   Receipt Logs Count:", receipt.logs?.length || 0);
    console.log("   Receipt Logs:", receipt.logs);
    
    // Confirm the address is cached for future use
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('workOrderRegistryAddress', contractData.address);
      } catch (e) {}
    }
    
    return receipt.hash;
  } catch (error) {
    console.error("❌ Blockchain submission error:", error);
    return null; 
  }
}


export async function fetchWorkOrderEvents() {
  try {
    const contractData = await getContractData();
    
    console.log("🔍 ========== FETCHING WORK ORDER LOGS ==========");
    console.log("📍 Contract Address:", contractData.address);

    const providerUrl = typeof window !== 'undefined' ? `${window.location.origin}/blockchain-rpc` : "http://127.0.0.1:8545";
    console.log("🌐 Provider URL:", providerUrl);
    
    const provider = new ethers.JsonRpcProvider(providerUrl);
    
    // Verify we can reach the provider
    try {
      const chainId = await provider.getNetwork();
      console.log("✅ Connected to chain ID:", chainId.chainId);
    } catch (e) {
      console.error("❌ Could not connect to provider:", e);
      return [];
    }

    const addressCode = await provider.getCode(contractData.address);
    if (!addressCode || addressCode === "0x") {
      console.error(`❌ No deployed contract found at ${contractData.address}. Audit data cannot be retrieved.`);
      return [];
    }

    const iface = new ethers.Interface(contractData.abi);

    // Compute the topic hash for WorkOrderCreated event
    const eventSignature = "WorkOrderCreated(string indexed id,string title,string asset,string priority,address creator,uint timestamp)";
    const eventTopic = iface.getEvent("WorkOrderCreated")?.topicHash;
    
    if (!eventTopic) {
      console.warn("⚠️ Could not compute WorkOrderCreated event topic");
      return [];
    }

    console.log("📋 Event Signature:", eventSignature);
    console.log("🏷️  Event Topic:", eventTopic);

    console.log("📡 Querying logs from block 0 to latest...");
    
    const logs = await provider.getLogs({
      address: contractData.address,
      topics: [eventTopic],
      fromBlock: 0,
      toBlock: "latest",
    });

    console.log(`📊 Found ${logs.length} log(s) matching the WorkOrderCreated event`);

    if (logs.length === 0) {
      console.warn("⚠️ NO LOGS FOUND - This could mean:");
      console.warn("   1. No work orders have been created yet");
      console.warn("   2. The contract address is incorrect");
      console.warn("   3. The blockchain was reset");
      console.warn("   4. The event is not being emitted properly");
    }

    return logs.map((log, idx) => {
      try {
        console.log(`\n🔎 Decoding log ${idx + 1}...`);
        console.log("   Transaction Hash:", log.transactionHash);
        console.log("   Block Number:", log.blockNumber);
        
        const decoded = iface.decodeEventLog("WorkOrderCreated", log.data, log.topics);
        
        console.log("   ✅ Decoded successfully:");
        console.log("      - ID:", decoded[0]);
        console.log("      - Title:", decoded[1]);
        console.log("      - Asset:", decoded[2]);
        console.log("      - Priority:", decoded[3]);
        console.log("      - Creator:", decoded[4]);
        console.log("      - Timestamp:", new Date(Number(decoded[5]) * 1000).toISOString());
        
        return {
          hash: log.transactionHash,
          bloc: `#${log.blockNumber}`,
          moteur: decoded[2]?.toString() || "—",  // asset
          action: `Création OT: ${decoded[1]?.toString() || "—"}`, // title
          date: new Date(Number(decoded[5]) * 1000).toLocaleString('fr-FR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
          }),
          user: decoded[4]?.toString() || "—", // creator address
        };
      } catch (decodeErr) {
        console.warn("   ❌ Failed to decode log:", decodeErr);
        return null;
      }
    }).filter(Boolean).reverse(); // newest first

  } catch (err) {
    console.error("❌ ========== BLOCKCHAIN FETCH ERROR ==========");
    console.error(err);
    return [];
  }
}
