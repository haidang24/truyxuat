const axios = require("axios");

async function testBlockchainIntegration() {
  const baseURL = "http://localhost:4000";

  console.log("Testing Blockchain-Only Integration...\n");

  try {
    // Test 0: Check blockchain status
    // console.log("0. Checking blockchain status...");
    // try {
    //   const statusResponse = await axios.get(`${baseURL}/blockchain/status`);
    //   console.log("✅ Blockchain status:", statusResponse.data);
    // } catch (error) {
    //   console.log(
    //     "⚠️ Blockchain status check failed:",
    //     error.response?.data?.message || error.message
    //   );
    // }

    // Test 1: Add a new product
    console.log("\n1. Adding new product to blockchain...");
    const newProduct = {
      id: "SP2023001",
      name: "Cà Phê Arabica",
      description: "Cà phê Arabica chất lượng cao từ Đà Lạt",
      variety: "Arabica Bourbon",
      origin: "Đà Lạt, Lâm Đồng",
      farmName: "Trang trại Organic Đà Lạt",
      farmAddress: "123 Đường Mimosa, Phường 10, Đà Lạt",
      farmerId: "DL001",
      farmerName: "Nguyễn Văn A",
      plantingDate: "2023-01-15",
      harvestDate: "2023-10-20",
      packagingDate: "2023-10-25",
      expiryDate: "2024-10-25",
      storageTemp: "15-25°C",
      storageInstr: "Bảo quản nơi khô ráo, thoáng mát",
      quantity: "1000",
      unit: "kg",
      grade: "Premium",
      certifications: "Organic, RainForest Alliance",
      images: "https://example.com/images/coffee-sp2023001.jpg",
    };

    const addResponse = await axios.post(`${baseURL}/product`, newProduct);
    console.log("✅ Product added:", {
      message: addResponse.data.message,
      productId: addResponse.data.product.id,
      txHash: addResponse.data.txHash?.substring(0, 20) + "...",
    });

    // Test 2: Add history entry
    console.log("\n2. Adding history entry to blockchain...");
    const historyEntry = {
      stage: "Thu hoạch",
      action: "Thu hái",
      description: "Thu hái cà phê chín đỏ, độ chín >90%",
      actor: "Nguyễn Văn B",
      actorRole: "Nông dân",
      location: "Khu D, Trang trại Organic Đà Lạt",
      temperature: "18°C",
      humidity: "75%",
      timestamp: new Date().toISOString(),
    };

    const historyResponse = await axios.post(
      `${baseURL}/product/${newProduct.id}/history`,
      historyEntry
    );
    console.log("✅ History added:", {
      message: historyResponse.data.message,
      stage: historyResponse.data.entry.stage,
      action: historyResponse.data.entry.action,
      txHash: historyResponse.data.txHash?.substring(0, 20) + "...",
    });

    // Test 3: Retrieve product from blockchain
    console.log("\n3. Retrieving product from blockchain...");
    const getResponse = await axios.get(`${baseURL}/product/${newProduct.id}`);
    console.log("✅ Product retrieved:", {
      id: getResponse.data.id,
      name: getResponse.data.name,
      farmName: getResponse.data.farmName,
      variety: getResponse.data.variety,
      dataSource: getResponse.data.dataSource,
      historyCount: getResponse.data.history.length,
      creator: getResponse.data.creator?.substring(0, 10) + "...",
    });

    // // Test 4: Get all products from blockchain
    // console.log("\n4. Getting all products from blockchain...");
    // const allProductsResponse = await axios.get(`${baseURL}/products`);
    // console.log("✅ Total products on blockchain:", {
    //   count: allProductsResponse.data.count,
    //   dataSource: allProductsResponse.data.dataSource,
    // });

    // // Test 5: Test error handling - try to get non-existent product
    // console.log("\n5. Testing error handling...");
    // try {
    //   await axios.get(`${baseURL}/product/NONEXISTENT`);
    // } catch (error) {
    //   console.log("✅ Error handling works:", error.response?.data?.message);
    // }

    console.log(
      "\n🎉 All blockchain tests passed! System is working in blockchain-only mode."
    );
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    console.error("Make sure:");
    console.error("1. Hardhat node is running (npx hardhat node)");
    console.error(
      "2. Contract is deployed (npx hardhat run scripts/deploy.js --network localhost)"
    );
    console.error("3. Server is running (npm start)");
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testBlockchainIntegration();
}

module.exports = testBlockchainIntegration;
