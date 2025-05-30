const { ethers } = require("ethers");
const fs = require("fs");

class BlockchainService {
  constructor() {
    // Kết nối tới Hardhat local network
    this.provider = new ethers.JsonRpcProvider("http://localhost:8545");

    // Contract ABI
    this.contractABI = [
      "function addProduct(string _id, string _name, string _origin, string _manufactureDate, string _supplier, string _category, string _weight, string _price, string _expiryDate, string _certifications) external",
      "function addHistoryEntry(string _productId, string _action, string _description, string _actor, string _location, string _timestamp) external",
      "function getProduct(string _productId) external view returns (tuple(string id, string name, string origin, string manufactureDate, string supplier, string category, string weight, string price, string expiryDate, string certifications, bool exists, address creator, uint256 timestamp))",
      "function getProductHistory(string _productId) external view returns (tuple(string productId, string action, string description, string actor, string location, string timestamp, address recorder, uint256 blockTimestamp)[])",
      "function getAllProductIds() external view returns (string[])",
      "function getProductCount() external view returns (uint256)",
      "event ProductAdded(string indexed productId, string name, address creator)",
      "event HistoryEntryAdded(string indexed productId, string action, address recorder)",
    ];

    this.contract = null;
    this.contractAddress = null;
    this.signer = null;

    this.loadContract();
  }

  async loadContract() {
    try {
      if (fs.existsSync("./contract-address.json")) {
        const contractInfo = JSON.parse(
          fs.readFileSync("./contract-address.json")
        );
        this.contractAddress = contractInfo.address;

        // Lấy signer (account đầu tiên từ Hardhat)
        this.signer = await this.provider.getSigner(0);
        this.contract = new ethers.Contract(
          this.contractAddress,
          this.contractABI,
          this.signer
        );
        console.log(
          "🔗 Blockchain service connected to contract:",
          this.contractAddress
        );
      } else {
        console.log(
          "❌ Contract address not found. Please deploy the contract first."
        );
        console.log(
          "Run: npx hardhat run scripts/deploy.js --network localhost"
        );
      }
    } catch (error) {
      console.error("❌ Error loading contract:", error.message);
    }
  }

  async addProduct(productData) {
    if (!this.contract) {
      await this.loadContract();
      if (!this.contract) {
        throw new Error(
          "Blockchain contract not available. Please ensure Hardhat node is running and contract is deployed."
        );
      }
    }

    try {
      console.log(`⛓️ Adding product ${productData.id} to blockchain...`);
      const tx = await this.contract.addProduct(
        productData.id,
        productData.name,
        productData.origin,
        productData.manufactureDate,
        productData.supplier,
        productData.category,
        productData.weight,
        productData.price,
        productData.expiryDate,
        productData.certifications || ""
      );

      await tx.wait();
      console.log(
        `✅ Product ${productData.id} added to blockchain successfully`
      );
      return tx.hash;
    } catch (error) {
      console.error(
        `❌ Error adding product ${productData.id} to blockchain:`,
        error.message
      );
      throw error;
    }
  }

  async addHistoryEntry(historyData) {
    if (!this.contract) {
      await this.loadContract();
      if (!this.contract) {
        throw new Error(
          "Blockchain contract not available. Please ensure Hardhat node is running and contract is deployed."
        );
      }
    }

    try {
      console.log(
        `⛓️ Adding history entry for product ${historyData.productId}...`
      );
      const tx = await this.contract.addHistoryEntry(
        historyData.productId,
        historyData.action,
        historyData.description,
        historyData.actor,
        historyData.location,
        historyData.timestamp
      );

      await tx.wait();
      console.log(
        `✅ History entry added for product ${historyData.productId} successfully`
      );
      return tx.hash;
    } catch (error) {
      console.error(
        `❌ Error adding history for product ${historyData.productId}:`,
        error.message
      );
      throw error;
    }
  }

  async getProduct(productId) {
    if (!this.contract) {
      await this.loadContract();
      if (!this.contract) {
        throw new Error(
          "Blockchain contract not available. Please ensure Hardhat node is running and contract is deployed."
        );
      }
    }

    try {
      console.log(`🔍 Getting product ${productId} from blockchain...`);
      const result = await this.contract.getProduct(productId);
      console.log(`✅ Product ${productId} retrieved from blockchain`);
      return {
        id: result.id,
        name: result.name,
        origin: result.origin,
        manufactureDate: result.manufactureDate,
        supplier: result.supplier,
        category: result.category,
        weight: result.weight,
        price: result.price,
        expiryDate: result.expiryDate,
        certifications: result.certifications,
        creator: result.creator,
        timestamp: result.timestamp.toString(),
      };
    } catch (error) {
      console.error(
        `❌ Error getting product ${productId} from blockchain:`,
        error.message
      );
      throw error;
    }
  }

  async getProductHistory(productId) {
    if (!this.contract) {
      await this.loadContract();
      if (!this.contract) {
        throw new Error(
          "Blockchain contract not available. Please ensure Hardhat node is running and contract is deployed."
        );
      }
    }

    try {
      console.log(
        `🔍 Getting history for product ${productId} from blockchain...`
      );
      const result = await this.contract.getProductHistory(productId);
      console.log(
        `✅ History for product ${productId} retrieved from blockchain (${result.length} entries)`
      );
      return result.map((entry) => ({
        productId: entry.productId,
        action: entry.action,
        description: entry.description,
        actor: entry.actor,
        location: entry.location,
        timestamp: entry.timestamp,
        recorder: entry.recorder,
        blockTimestamp: entry.blockTimestamp.toString(),
      }));
    } catch (error) {
      console.error(
        `❌ Error getting history for product ${productId}:`,
        error.message
      );
      throw error;
    }
  }

  async getAllProducts() {
    if (!this.contract) {
      await this.loadContract();
      if (!this.contract) {
        throw new Error(
          "Blockchain contract not available. Please ensure Hardhat node is running and contract is deployed."
        );
      }
    }

    try {
      console.log("🔍 Getting all products from blockchain...");
      const productIds = await this.contract.getAllProductIds();
      const products = [];

      for (const id of productIds) {
        try {
          const product = await this.getProduct(id);
          products.push(product);
        } catch (error) {
          console.error(`❌ Error getting product ${id}:`, error.message);
        }
      }

      console.log(`✅ Retrieved ${products.length} products from blockchain`);
      return products;
    } catch (error) {
      console.error(
        "❌ Error getting all products from blockchain:",
        error.message
      );
      throw error;
    }
  }

  async getContractInfo() {
    if (!this.contract) {
      await this.loadContract();
    }

    return {
      address: this.contractAddress,
      isConnected: !!this.contract,
      provider: this.provider ? "Connected" : "Disconnected",
    };
  }
}

module.exports = BlockchainService;
