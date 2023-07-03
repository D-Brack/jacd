// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat")

const tokens = (amount) => {
  return ethers.parseUnits(amount.toString(), 'ether')
}

const ether = tokens

async function main() {
  const JACDToken = await hre.ethers.getContractFactory('JACDToken')
  const jacdToken = await JACDToken.deploy('JACD Coin', 'JACD')

  console.log(`JACD Coin deployed to ${jacdToken.target}`)

  const USDCToken = await hre.ethers.getContractFactory('JACDToken')
  const usdcToken = await USDCToken.deploy('USD Coin', 'USDC')

  console.log(`USDC Coin deployed to ${usdcToken.target}`)

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

  const collections = [jetpacks.target, hoverboards.target, avas.target]

  const JACD = await hre.ethers.getContractFactory('JACD')
  const jacd = await JACD.deploy(jacdToken.target, usdcToken.target, collections, 6, 100, 3, tokens(600))

  console.log(`JACD deployed to ${jacd.target}`)

  const signer = await hre.ethers.getSigner('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')

  transaction = await jacdToken.connect(signer).transferOwnership(jacd)
  await transaction.wait()

  console.log(`JACDToken ownership transferred to ${await jacdToken.owner()}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
