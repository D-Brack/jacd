const { expect } = require('chai')
const { ethers } = require('hardhat')

const tokens = (amount) => {
  return ethers.utils.parseUnits(amount.toString(), 'ether')
}

describe('JACD Token', () => {
  const NAME = 'Jadu Ava Charities Dao'
  const SYMBOL = 'JACD'

  let jacd, transaction, result

  beforeEach(async () => {

    const JACD = await ethers.getContractFactory('JACDToken')
    jacd = await JACD.deploy(NAME, SYMBOL)
  })

  describe('Deployment', () => {
    it('sets the name and symbol', async () => {
      expect(await jacd.name()).to.equal(NAME)
      expect(await jacd.symbol()).to.equal(SYMBOL)
    })
  })
})
