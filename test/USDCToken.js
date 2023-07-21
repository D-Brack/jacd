const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('USDC Token', () => {
  const NAME = 'USD Coin'
  const SYMBOL = 'USDC'

  let jacd, owner, user, transaction, result

  beforeEach(async () => {
    const accounts = await ethers.getSigners()
    owner = accounts[0]
    user = accounts[1]

    const JACD = await ethers.getContractFactory('USDCToken')
    jacd = await JACD.deploy(NAME, SYMBOL)
  })

  describe('Deployment', () => {
    it('sets the name and symbol', async () => {
      expect(await jacd.name()).to.equal(NAME)
      expect(await jacd.symbol()).to.equal(SYMBOL)
    })

    it('returns decimals of 6', async () => {
      expect(await jacd.decimals()).to.equal(6)
    })

    it('sets token total supply to 0', async () => {
      expect(await jacd.totalSupply()).to.equal(0)
    })
  })

  describe('Minting', () => {
    describe('Success', () => {
      beforeEach(async () => {
        transaction = await jacd.connect(owner).mint(user.address, AMOUNT)
        await transaction.wait()
      })

      it('increases total supply', async () => {
        expect(await jacd.totalSupply()).to.equal(AMOUNT)
      })

      it('increases user balance', async () => {
        expect(await jacd.balanceOf(user.address)).to.equal(AMOUNT)
      })
    })

    describe('Failure', () => {
      it('rejects invalid receiver address', async () => {
        await expect(jacd.connect(owner).mint('0x0000000000000000000000000000000000000000', AMOUNT)).to.be.reverted
      })

      it('rejects calls from non-owner', async () => {
        await expect(jacd.connect(user).mint(owner.address, AMOUNT)).to.be.reverted
      })
    })
  })
})
