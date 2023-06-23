const { expect } = require('chai')
const { ethers } = require('hardhat')
const { CompilationJobCreationErrorReason } = require('hardhat/types')

const tokens = (amount) => {
  return ethers.utils.parseUnits(amount.toString(), 'ether')
}

describe('JACD Token', () => {
  const NAME = 'Jadu Avas Charities DAO'
  const SYMBOL = 'JACD'

  let jacd, owner, user, transaction, result

  beforeEach(async () => {
    const accounts = await ethers.getSigners()
    owner = accounts[0]
    user = accounts[1]

    const JACD = await ethers.getContractFactory('JACDToken')
    jacd = await JACD.deploy(NAME, SYMBOL)
  })

  describe('Deployment', () => {
    it('sets the name and symbol', async () => {
      expect(await jacd.name()).to.equal(NAME)
      expect(await jacd.symbol()).to.equal(SYMBOL)
    })

    it('returns 0 decimals for tokens', async () => {
      expect(await jacd.decimals()).to.equal(0)
    })

    it('sets token total supply to 0', async () => {
      expect(await jacd.totalSupply()).to.equal(0)
    })
  })

  describe('Minting', () => {
    describe('Success', () => {
      beforeEach(async () => {
        transaction = await jacd.connect(owner).mint(user.address, 1)
        await transaction.wait()
      })

      it('increases total supply', async () => {
        expect(await jacd.totalSupply()).to.equal(1)
      })

      it('increases user balance', async () => {
        expect(await jacd.balanceOf(user.address)).to.equal(1)
      })
    })

    describe('Failure', () => {
      it('rejects invalid receiver address', async () => {
        await expect(jacd.connect(owner).mint('0x0000000000000000000000000000000000000000', 1)).to.be.reverted
      })

      it('rejects calls from non-owner', async () => {
        await expect(jacd.connect(user).mint(owner.address, 1)).to.be.reverted
      })
    })
  })
})
