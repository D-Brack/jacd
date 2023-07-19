// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat")

const tokens = (amount) => {
  return ethers.utils.parseUnits(amount.toString(), 'ether')
}

const ether = tokens
const votes = tokens

async function main() {
  const JACDToken = await hre.ethers.getContractFactory('JACDToken')
  const jacdToken = await JACDToken.deploy('JACD Coin', 'JACD')

  console.log(`JACD Coin deployed to ${jacdToken.address}`)

  const USDCToken = await hre.ethers.getContractFactory('JACDToken')
  const usdcToken = await USDCToken.deploy('USD Coin', 'USDC')

  console.log(`USDC Coin deployed to ${usdcToken.address}`)

  const Jetpacks = await ethers.getContractFactory('NFT')
  const jetpacks = await Jetpacks.deploy(
    'Jetpacks',
    'JP',
    ether(.01),
    1,
    Date.now().toString().slice(0, 10),
    'x',
    1
  )

  console.log(`Jetpacks deployed to ${jetpacks.address}`)

  const Hoverboards = await ethers.getContractFactory('NFT')
  const hoverboards = await Hoverboards.deploy(
    'Hoverboards',
    'HB',
    ether(.01),
    2,
    Date.now().toString().slice(0, 10),
    'y',
    2
  )

  console.log(`Hoverboards deployed to ${hoverboards.address}`)

  const AVAs = await ethers.getContractFactory('NFT')
  const avas = await AVAs.deploy(
    'AVAs',
    'AVA',
    ether(.01),
    3,
    Date.now().toString().slice(0, 10),
    'z',
    3
  )

  console.log(`AVAs deployed to ${avas.address}`)

  const collections = [jetpacks.address, hoverboards.address, avas.address]

  const JACD = await hre.ethers.getContractFactory('JACD')
  const jacd = await JACD.deploy(jacdToken.address, usdcToken.address, collections, 10, 100, 6, 3, votes(600), 120, 120)

  console.log(`JACD deployed to ${jacd.address}`)

  const accounts = await hre.ethers.getSigners()
  const signer = accounts[0]

  transaction = await jacdToken.connect(signer).transferOwnership(jacd.address)
  await transaction.wait()

  console.log(`JACDToken ownership transferred to ${await jacdToken.owner()}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
