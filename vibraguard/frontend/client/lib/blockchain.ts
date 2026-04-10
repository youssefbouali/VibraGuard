import { ethers } from "ethers";

// Fallback ABI in case the deployment script hasn't generated the JSON yet
const DEFAULT_ABI = [
  "function createWorkOrder(string memory _id, string memory _title, string memory _asset, string memory _priority) public",
  "function getWorkOrderCount() public view returns (uint)",
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

  let contractData = { address: DEFAULT_ADDRESS, abi: DEFAULT_ABI };
  
  // Try to load from WorkOrderRegistry.json
  try {
    const dynamicData = await import("./WorkOrderRegistry.json");
    if (dynamicData.address) {
      contractData = dynamicData as any;
      console.log("✅ Loaded contract address from WorkOrderRegistry.json:", dynamicData.address);
    }
  } catch (e) {
    console.log("⚠️ WorkOrderRegistry.json not found, attempting discovery...");
    
    // Try to discover the actual deployed address
    try {
      const providerUrl = typeof window !== 'undefined' ? `${window.location.origin}/blockchain-rpc` : "http://127.0.0.1:8545";
      const provider = new ethers.JsonRpcProvider(providerUrl);
      const discoveredAddress = await discoverContractAddress(provider);
      
      if (discoveredAddress) {
        contractData.address = discoveredAddress;
      } else {
        console.warn("⚠️ Using default fallback address:", DEFAULT_ADDRESS);
      }
    } catch (discoveryError) {
      console.warn("⚠️ Discovery failed, using default address:", DEFAULT_ADDRESS, discoveryError);
    }
  }

  // Cache it for consistent use across the session
  contractDataCache = contractData;
  
  // Also save to localStorage for persistence across page reloads
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('workOrderRegistryAddress', contractData.address);
      console.log("💾 Saved contract address to localStorage:", contractData.address);
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }
  
  return contractData;
}

export async function submitWorkOrderToBlockchain(order: any) {
  try {
    let contractData = await getContractData();

    const providerUrl = typeof window !== 'undefined' ? `${window.location.origin}/blockchain-rpc` : "http://127.0.0.1:8545";
    const provider = new ethers.JsonRpcProvider(providerUrl);
    
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
