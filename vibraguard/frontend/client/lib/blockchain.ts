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
    let contractData = { address: DEFAULT_ADDRESS, abi: DEFAULT_ABI };
    try {
      const dynamicData = await import("./WorkOrderRegistry.json");
      if (dynamicData.address) contractData = dynamicData;
    } catch (e) {}

    // Use the proxy route to bypass firewall blocked ports
    const providerUrl = typeof window !== 'undefined' ? `${window.location.origin}/blockchain-rpc` : "http://127.0.0.1:8545";
    const provider = new ethers.JsonRpcProvider(providerUrl);
    const contract = new ethers.Contract(contractData.address, contractData.abi, provider);
    
    // Fetch past events
    const filter = contract.filters.WorkOrderCreated();
    const events = await contract.queryFilter(filter);
    
    return events.map((event: any) => ({
      hash: event.transactionHash,
      bloc: `#${event.blockNumber}`,
      moteur: event.args[2], // asset
      action: `Création OT: ${event.args[1]}`, // title
      date: new Date(Number(event.args[5]) * 1000).toLocaleString('fr-FR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }),
      user: event.args[4] // address
    })).reverse(); // Newest first
    
  } catch (err) {
    console.error("Failed to fetch blockchain events:", err);
    return [];
  }
}
