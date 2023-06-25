const { expect } = require('chai')
const { ethers } = require('hardhat')

const tokens = (amount) => {
  return ethers.parseUnits(amount.toString(), 'ether')
}

describe('JACD', () => {
  const NAME = 'Jadu Avas Charities DAO'
  const SYMBOL = 'JACD'
  const AMOUNT = tokens(1)

  let jacdDAO, jacdToken, usdcToken, deployer, user
  let transaction, result

  beforeEach(async () => {
    const accounts = await ethers.getSigners()
    deployer = accounts[0]
    user = accounts[1]

    const JACDToken = await ethers.getContractFactory('JACDToken')
    jacdToken = await JACDToken.deploy(NAME, SYMBOL)

    const USDCToken = await ethers.getContractFactory('JACDToken')
    usdcToken = await USDCToken.deploy('USD Coin', 'USDC')

    transaction = await usdcToken.connect(deployer).mint(user.address, AMOUNT)
    await transaction.wait()

    const JACDDAO = await ethers.getContractFactory('JACD')
    jacdDAO = await JACDDAO.deploy(jacdToken.target, usdcToken.target)

    transaction = await jacdToken.connect(deployer).transferOwnership(jacdDAO)
    await transaction.wait()
  })

  describe('Deployment', () => {
    it('initializes the JACD token contract', async () => {
      expect(await jacdDAO.jacdToken()).to.equal(jacdToken.target)
    })

    it('initializes the USDC token contract', async () => {
      expect(await jacdDAO.usdcToken()).to.equal(usdcToken.target)
    })
  })

  describe('Receiving Deposits', () => {
    describe('Success', () => {
      beforeEach(async () => {
        transaction = await usdcToken.connect(user).approve(jacdDAO.target, AMOUNT)
        await transaction.wait()

        transaction = await jacdDAO.connect(user).receiveDeposit(AMOUNT)
        await transaction.wait()
      })

      it('accepts token deposits', async () => {
        expect(await usdcToken.balanceOf(user.address)).to.equal(0)
        expect(await usdcToken.balanceOf(jacdDAO.target)).to.equal(AMOUNT)
        expect(await jacdDAO.usdcBalance()).to.equal(AMOUNT)
      })
    })

    describe('Failure', () => {
      it('rejects deposits of 0', async () => {
        transaction = await usdcToken.connect(user).approve(jacdDAO.target, AMOUNT)
        await transaction.wait()

        await expect(jacdDAO.connect(user).receiveDeposit(0)).to.be.reverted
      })
    })

    describe('Distributing JACD Tokens', () => {
      describe('Success', () => {
        beforeEach(async () => {
          transaction = await usdcToken.connect(user).approve(jacdDAO.target, AMOUNT)
          await transaction.wait()

          transaction = await jacdDAO.connect(user).receiveDeposit(AMOUNT)
          await transaction.wait()
        })

        it('sends JACD tokens to depositer', async () => {
          expect(await jacdToken.balanceOf(user.address)).to.equal(AMOUNT)
        })

        it('updates the total supply of JACD tokens', async () => {
          expect(await jacdDAO.jacdSupply()).to.equal(AMOUNT)
        })
      })

      describe('Failure', () => {

      })
    })
  })
})
