require("@nomicfoundation/hardhat-toolbox");
require("hardhat-ethernal");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    // for testnet
    lisksepolia: {
      url: "https://rpc.sepolia-api.lisk.com",
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      ],
      gasPrice: 1000000000,
    },
  },
};
