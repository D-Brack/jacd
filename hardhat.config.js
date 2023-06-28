require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      blockGasLimit: 10000000000
    }
  },
  mocha: {
    timeout: 110000
  }
};
