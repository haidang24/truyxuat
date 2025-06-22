const { ethers } = require("ethers");
const fs = require("fs");

class BlockchainService {
  constructor() {
    // Kết nối tới Hardhat local network
    this.provider = new ethers.JsonRpcProvider("http://localhost:8545");

    // Contract ABI
    this.contractABI = [
      "function addProduct(string _id, string _name, string _description, string _variety, string _origin, string _farmName, string _farmAddress, string _farmerId, string _farmerName, string _plantingDate, string _harvestDate, string _packagingDate, string _expiryDate, string _storageTemp, string _storageInstr, string _quantity, string _unit, string _grade, string _certifications, string _images) external",
      "function addHistoryEntry(string _productId, string _stage, string _action, string _description, string _actor, string _actorRole, string _location, string _temperature, string _humidity, string _timestamp) external",
      "function getProduct(string _productId) external view returns (tuple(string id, string name, string description, string variety, string origin, string farmName, string farmAddress, string farmerId, string farmerName, string plantingDate, string harvestDate, string packagingDate, string expiryDate, string storageTemp, string storageInstr, string quantity, string unit, string grade, string certifications, string images, bool exists, address creator, uint256 timestamp))",
      "function getProductHistory(string _productId) external view returns (tuple(string productId, string stage, string action, string description, string actor, string actorRole, string location, string temperature, string humidity, string timestamp, address recorder, uint256 blockTimestamp)[])",
      "function getAllProductIds() external view returns (string[])",
      "function getProductCount() external view returns (uint256)",
      "event ProductAdded(string indexed productId, string name, address creator)",
      "event HistoryEntryAdded(string indexed productId, string stage, string action, address recorder)",
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
        productData.description,
        productData.variety,
        productData.origin,
        productData.farmName,
        productData.farmAddress,
        productData.farmerId,
        productData.farmerName,
        productData.plantingDate,
        productData.harvestDate,
        productData.packagingDate,
        productData.expiryDate,
        productData.storageTemp,
        productData.storageInstr,
        productData.quantity,
        productData.unit,
        productData.grade,
        productData.certifications,
        productData.images
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
        historyData.stage,
        historyData.action,
        historyData.description,
        historyData.actor,
        historyData.actorRole,
        historyData.location,
        historyData.temperature,
        historyData.humidity,
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
        description: result.description,
        variety: result.variety,
        origin: result.origin,
        farmName: result.farmName,
        farmAddress: result.farmAddress,
        farmerId: result.farmerId,
        farmerName: result.farmerName,
        plantingDate: result.plantingDate,
        harvestDate: result.harvestDate,
        packagingDate: result.packagingDate,
        expiryDate: result.expiryDate,
        storageTemp: result.storageTemp,
        storageInstr: result.storageInstr,
        quantity: result.quantity,
        unit: result.unit,
        grade: result.grade,
        certifications: result.certifications,
        images: result.images,
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
        stage: entry.stage,
        action: entry.action,
        description: entry.description,
        actor: entry.actor,
        actorRole: entry.actorRole,
        location: entry.location,
        temperature: entry.temperature,
        humidity: entry.humidity,
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
