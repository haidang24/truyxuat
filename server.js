const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const BlockchainService = require("./blockchain-service");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Khởi tạo blockchain service
const blockchainService = new BlockchainService();

// Lấy thông tin sản phẩm theo ID từ blockchain
app.get("/product/:id", async (req, res) => {
  const id = req.params.id;
  try {
    console.log(`Getting product ${id} from blockchain...`);

    const product = await blockchainService.getProduct(id);
    const history = await blockchainService.getProductHistory(id);

    // Trả về sản phẩm kèm lịch sử
    const result = {
      ...product,
      history: history,
      dataSource: "blockchain",
    };

    console.log("Product loaded from blockchain:", result.id);
    res.json(result);
  } catch (error) {
    console.error("Error getting product from blockchain:", error);
    if (error.message.includes("San pham khong ton tai")) {
      res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trên blockchain" });
    } else {
      res.status(500).json({ message: "Lỗi khi truy xuất từ blockchain" });
    }
  }
});

// API thêm sản phẩm mới vào blockchain
app.post("/product", async (req, res) => {
  try {
    const newProduct = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!newProduct.id || !newProduct.name) {
      return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });
    }

    console.log(`Adding product ${newProduct.id} to blockchain...`);

    // Thêm vào blockchain
    const txHash = await blockchainService.addProduct(newProduct);
    console.log(
      `Product ${newProduct.id} added to blockchain with tx: ${txHash}`
    );

    res.status(201).json({
      message: "Đã thêm sản phẩm vào blockchain",
      product: newProduct,
      txHash: txHash,
    });
  } catch (error) {
    console.error("Error adding product to blockchain:", error);
    if (error.message.includes("San pham da ton tai")) {
      res
        .status(400)
        .json({ message: "ID sản phẩm đã tồn tại trên blockchain" });
    } else {
      res.status(500).json({ message: "Lỗi khi thêm sản phẩm vào blockchain" });
    }
  }
});

// API thêm giai đoạn mới vào lịch sử sản phẩm trên blockchain
app.post("/product/:id/history", async (req, res) => {
  try {
    const productId = req.params.id;
    const historyEntry = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!historyEntry.action) {
      return res.status(400).json({ message: "Thiếu thông tin lịch sử" });
    }

    console.log(`Adding history for product ${productId} to blockchain...`);

    // Chuẩn bị dữ liệu lịch sử cho blockchain
    const blockchainHistoryEntry = {
      productId: productId,
      action: historyEntry.action,
      description: historyEntry.description || "",
      actor: historyEntry.actor || "",
      location: historyEntry.location || "",
      timestamp: historyEntry.timestamp || new Date().toISOString(),
    };

    // Thêm vào blockchain
    const txHash = await blockchainService.addHistoryEntry(
      blockchainHistoryEntry
    );
    console.log(
      `History for ${productId} added to blockchain with tx: ${txHash}`
    );

    res.status(201).json({
      message: "Đã thêm lịch sử sản phẩm vào blockchain",
      entry: blockchainHistoryEntry,
      txHash: txHash,
    });
  } catch (error) {
    console.error("Error adding history to blockchain:", error);
    if (error.message.includes("San pham khong ton tai")) {
      res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trên blockchain" });
    } else {
      res.status(500).json({ message: "Lỗi khi thêm lịch sử vào blockchain" });
    }
  }
});

// API lấy tất cả sản phẩm từ blockchain
app.get("/products", async (req, res) => {
  try {
    console.log("Getting all products from blockchain...");
    const products = await blockchainService.getAllProducts();
    res.json({
      products: products,
      count: products.length,
      dataSource: "blockchain",
    });
  } catch (error) {
    console.error("Error getting products from blockchain:", error);
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu từ blockchain" });
  }
});

// API lấy tất cả sản phẩm từ blockchain (endpoint cũ để tương thích)
app.get("/blockchain/products", async (req, res) => {
  try {
    const products = await blockchainService.getAllProducts();
    res.json({
      products: products,
      count: products.length,
    });
  } catch (error) {
    console.error("Error getting products from blockchain:", error);
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu từ blockchain" });
  }
});

// API kiểm tra trạng thái blockchain
app.get("/blockchain/status", async (req, res) => {
  try {
    if (!blockchainService.contract) {
      await blockchainService.loadContract();
    }

    if (blockchainService.contract) {
      const productCount = await blockchainService.contract.getProductCount();
      res.json({
        status: "connected",
        contractAddress: blockchainService.contractAddress,
        productCount: productCount.toString(),
      });
    } else {
      res.status(503).json({
        status: "disconnected",
        message: "Blockchain không khả dụng",
      });
    }
  } catch (error) {
    console.error("Error checking blockchain status:", error);
    res.status(503).json({
      status: "error",
      message: "Lỗi khi kiểm tra blockchain",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
  console.log("🔗 Blockchain-only mode enabled");
  console.log("📝 All data operations use blockchain storage");
});
