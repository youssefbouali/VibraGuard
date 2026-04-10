import { ethers } from "ethers";

// Fallback ABI in case the deployment script hasn't generated the JSON yet
const DEFAULT_ABI = [
  "function createWorkOrder(string memory _id, string memory _title, string memory _asset, string memory _priority) public",
  "function getWorkOrderCount() public view returns (uint)",
  "event WorkOrderCreated(string indexed id, string title, string asset, string priority, address creator, uint timestamp)"
];

const DEFAULT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Typical first hardhat address

export async function submitWorkOrderToBlockchain(order: any) {
  try {
    let contractData = { address: DEFAULT_ADDRESS, abi: DEFAULT_ABI };
    try {
      const dynamicData = await import("./WorkOrderRegistry.json");
      if (dynamicData.address) contractData = dynamicData as any;
    } catch (e) {
      console.warn("Using default contract ABI/Address");
    }

    const providerUrl = typeof window !== 'undefined' ? `${window.location.origin}/blockchain-rpc` : "http://127.0.0.1:8545";
    const provider = new ethers.JsonRpcProvider(providerUrl);
    
    // Use Hardhat account #0 private key (well-known test key, safe for local blockchain only)
    const HARDHAT_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const signer = new ethers.Wallet(HARDHAT_PRIVATE_KEY, provider);

    const contract = new ethers.Contract(contractData.address, contractData.abi, signer);

    const tx = await contract.createWorkOrder(
      order.id || ("W-" + Math.floor(Math.random() * 10000)),
      order.title || "Sans titre",
      order.asset || "Inconnu",
      order.priority || "medium"
    );

    const receipt = await tx.wait();
    console.log("✅ Mined to blockchain! TX Hash:", receipt.hash);
    return receipt.hash;
  } catch (error) {
    console.error("Blockchain error:", error);
    return null; 
  }
}

export async function fetchWorkOrderEvents() {
  try {
    let contractData: { address: string; abi: any[] } = { address: DEFAULT_ADDRESS, abi: DEFAULT_ABI };
    try {
      const dynamicData = await import("./WorkOrderRegistry.json");
      if (dynamicData.address) contractData = dynamicData as any;
    } catch (e) {}

    const providerUrl = typeof window !== 'undefined' ? `${window.location.origin}/blockchain-rpc` : "http://127.0.0.1:8545";
    const provider = new ethers.JsonRpcProvider(providerUrl);
    const iface = new ethers.Interface(contractData.abi);

    // Compute the topic hash for WorkOrderCreated event
    // Using getLogs directly avoids indexed-string filtering bug in ethers v6
    const eventTopic = iface.getEvent("WorkOrderCreated")?.topicHash;
    if (!eventTopic) return [];

    const logs = await provider.getLogs({
      address: contractData.address,
      topics: [eventTopic],
      fromBlock: 0,
      toBlock: "latest",
    });

    return logs.map((log) => {
      try {
        const decoded = iface.decodeEventLog("WorkOrderCreated", log.data, log.topics);
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
        console.warn("Failed to decode log:", decodeErr);
        return null;
      }
    }).filter(Boolean).reverse(); // newest first

  } catch (err) {
    console.error("Failed to fetch blockchain events:", err);
    return [];
  }
}
