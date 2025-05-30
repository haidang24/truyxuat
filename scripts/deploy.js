const hre = require("hardhat");

async function main() {
  console.log("Deploying ProductTraceability contract...");

  const ProductTraceability = await hre.ethers.getContractFactory(
    "ProductTraceability"
  );
  const contract = await ProductTraceability.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("ProductTraceability contract deployed to:", contractAddress);

  // Lưu địa chỉ contract vào file để sử dụng trong server
  const fs = require("fs");
  const contractInfo = {
    address: contractAddress,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./contract-address.json",
    JSON.stringify(contractInfo, null, 2)
  );
  console.log("Contract address saved to contract-address.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
