const hre = require('hardhat')
const config = require('../src/config.json')

const tokens = (amount) => {
  return ethers.utils.parseUnits(amount.toString(), 'ether')
}

const ether = tokens
const votes = tokens

const usdc = (amount) => {
  return amount * 10**6
}

async function main() {
  let transaction

  const provider = await hre.ethers.getDefaultProvider()

  const accounts = await hre.ethers.getSigners()
  const deployer = accounts[0]

  const { chainId } = await hre.ethers.provider.getNetwork()

  console.log('minting USDC tokens...')

  const usdcToken = await hre.ethers.getContractAt('USDCToken', config[chainId].usdcToken.address)

  transaction = await usdcToken.connect(deployer).mint(deployer.address, usdc(1000000))
  await transaction.wait()

  console.log('minting jetpacks...')

  const jetpacks = await hre.ethers.getContractAt('NFT', config[chainId].jetpacks.address)

  transaction = await jetpacks.connect(deployer).addToWhitelist(deployer.address)
  await transaction.wait()

  transaction = await jetpacks.connect(deployer).mint(100, { value: ether(.1) })
  await transaction.wait()

  console.log('minting hoverboards...')

  const hoverboards = await hre.ethers.getContractAt('NFT', config[chainId].hoverboards.address)

  transaction = await hoverboards.connect(deployer).addToWhitelist(deployer.address)
  await transaction.wait()

  transaction = await hoverboards.connect(deployer).mint(100, { value: ether(.1) })

  console.log('minting avas...')

  const avas = await hre.ethers.getContractAt('NFT', config[chainId].avas.address)

  transaction = await avas.connect(deployer).addToWhitelist(deployer.address)
  await transaction.wait()

  transaction = await avas.connect(deployer).mint(100, { value: ether(.1) })
  await transaction.wait()

  console.log('send ETH to DAO...')

  const dao = await hre.ethers.getContractAt('JACD', config[chainId].jacdDAO.address)

  transaction = await deployer.sendTransaction({ to: dao.address, value: ether(1000)})
  await transaction.wait()

  console.log('approve DAO to transfer assets...')

  transaction = await usdcToken.connect(deployer).approve(dao.address, usdc(1000000))
  await transaction.wait()

  transaction = await hoverboards.connect(deployer).setApprovalForAll(dao.address, true)
  await transaction.wait()

  console.log('deposit USDC...')

  transaction = await dao.connect(deployer).receiveDeposit(usdc(500))
  await transaction.wait()

  console.log('finished!')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
