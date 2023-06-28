const { expect } = require('chai')
const { ethers } = require('hardhat')
const { time } = require('@nomicfoundation/hardhat-toolbox/network-helpers')

const tokens = (amount) => {
  return ethers.parseUnits(amount.toString(), 'ether')
}

const ether = tokens

describe('JACD', () => {
  const NAME = 'Jadu Avas Charities DAO'
  const SYMBOL = 'JACD'
  const AMOUNT = tokens(1)

  let jacdDAO, jacdToken, usdcToken, jetpacks, hoverboards, avas, deployer, user
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

    const Jetpacks = await ethers.getContractFactory('NFT')
    jetpacks = await Jetpacks.deploy('Jetpacks', 'JP', ether(.01), 1111, Date.now().toString().slice(0, 10), 'x', 1111)

    const Hoverboards = await ethers.getContractFactory('NFT')
    hoverboards = await Hoverboards.deploy('Hoverboards', 'HB', ether(.01), 6666, Date.now().toString().slice(0, 10), 'y', 6666)

    const AVAs = await ethers.getContractFactory('NFT')
    avas = await AVAs.deploy('AVAs', 'AVA', ether(.01), 11111, Date.now().toString().slice(0, 10), 'z', 11111)

    const JACDDAO = await ethers.getContractFactory('JACD')
    jacdDAO = await JACDDAO.deploy(jacdToken.target, usdcToken.target, jetpacks.target, hoverboards.target, avas.target)

    transaction = await jacdToken.connect(deployer).transferOwnership(jacdDAO)
    await transaction.wait()
  })

  describe('Deployment', () => {
    it('initializes token contracts', async () => {
      expect(await jacdDAO.jacdToken()).to.equal(jacdToken.target)
      expect(await jacdDAO.usdcToken()).to.equal(usdcToken.target)
    })

    it('initializes NFT collection contracts', async () => {
      expect(await jacdDAO.jetpacks()).to.equal(jetpacks.target)
      expect(await jacdDAO.hoverboards()).to.equal(hoverboards.target)
      expect(await jacdDAO.avas()).to.equal(avas.target)
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

      describe('Distribution JACD Tokens', () => {

        it('sends JACD tokens to depositer', async () => {
          expect(await jacdToken.balanceOf(user.address)).to.equal(AMOUNT)
        })

        it('updates the total supply of JACD tokens', async () => {
          expect(await jacdDAO.jacdSupply()).to.equal(AMOUNT)
        })
      })

      it('emits a Deposit event', async () => {
        await expect(transaction).to.emit(jacdDAO, 'Deposit').withArgs(
          user.address,
          AMOUNT,
          (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp
        )
      })
    })

    describe('Failure', () => {
      it('rejects deposits of 0', async () => {
        transaction = await usdcToken.connect(user).approve(jacdDAO.target, AMOUNT)
        await transaction.wait()

        await expect(jacdDAO.connect(user).receiveDeposit(0)).to.be.reverted
      })
    })
  })

  describe('Distributing JACD Tokens', () => {
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

  describe('Creating Proposals', () => {
    describe('Success', () => {
      beforeEach(async () => {
        transaction = await usdcToken.connect(user).approve(jacdDAO.target, AMOUNT)
        await transaction.wait()

        transaction = await jacdDAO.connect(user).receiveDeposit(AMOUNT)
        await transaction.wait()

        transaction = await avas.connect(deployer).addToWhitelist(deployer.address)
        await transaction.wait()

        transaction = await avas.connect(deployer).mint(1, { value: ether(.01) })
        await transaction.wait()

        transaction = await jacdDAO.connect(deployer).createProposal(user.address, tokens(.1), 'Prop 1')
        await transaction.wait()
      })

      it('creates & stores a new proposal', async () => {
        expect(await jacdDAO.proposalCount()).to.equal(1)

        const proposal = await jacdDAO.proposals(1)
        expect(proposal.index).to.equal(1)
        expect(proposal.recipient).to.equal(user.address)
        expect(proposal.amount).to.equal(tokens(.1))
        expect(proposal.description).to.equal('Prop 1')
        expect(proposal.votesFor).to.equal(0)
        expect(proposal.votesAgainst).to.equal(0)
        expect(proposal.stage).to.equal(0)
        expect(proposal.voteEnd).to.equal(
          (await ethers.provider.getBlock(await ethers.provider.getBlockNumber()))
          .timestamp + 604800
        )
      })

      it('emits a Propose event', async () => {
        await expect(transaction).emit(jacdDAO, 'Propose').withArgs(
          1,
          user.address,
          tokens(.1),
          'Prop 1',
          deployer.address,
          (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp
        )
      })
    })

    describe('Failure', () => {
      beforeEach(async () => {
        transaction = await usdcToken.connect(user).approve(jacdDAO.target, AMOUNT)
        await transaction.wait()

        transaction = await jacdDAO.connect(user).receiveDeposit(AMOUNT)
        await transaction.wait()

        transaction = await avas.connect(deployer).addToWhitelist(deployer.address)
        await transaction.wait()

        transaction = await avas.connect(deployer).mint(1, { value: ether(.01) })
        await transaction.wait()
      })

      it('rejects proposals from non-holders', async () => {
        await expect(jacdDAO.connect(user).createProposal(
          deployer.address,
          tokens(.1),
          'Prop 1'
        )).to.be.reverted
      })

      it('rejects proposals with amounts of 0', async () => {
        await expect(jacdDAO.connect(deployer).createProposal(
          user.address,
          0,
          'Prop 1'
        )).to.be.reverted
      })

      it('rejects proposals with amounts of over 10% of USDC balance', async () => {
        await expect(jacdDAO.connect(deployer).createProposal(
          user.address,
          AMOUNT,
          'Prop 1'
        )).to.be.reverted
      })

      it('rejects proposals with no descritpion', async () => {
        await expect(jacdDAO.connect(deployer).createProposal(
          user.address,
          tokens(.1),
          ''
        )).to.be.reverted
      })

      it('rejects proposals with invalid recipient address', async () => {
        await expect(jacdDAO.connect(deployer).createProposal(
          '0x0000000000000000000000000000000000000000',
          AMOUNT,
          'Prop 1'
        )).to.be.reverted
      })
    })
  })

  describe('Holder Voting', () => {
    describe('Success', () => {
      beforeEach(async () => {
        transaction = await usdcToken.connect(user).approve(jacdDAO.target, AMOUNT)
        await transaction.wait()

        transaction = await jacdDAO.connect(user).receiveDeposit(AMOUNT)
        await transaction.wait()

        transaction = await avas.connect(deployer).addToWhitelist(deployer.address)
        await transaction.wait()

        transaction = await avas.connect(deployer).mint(1, { value: ether(.01) })
        await transaction.wait()

        transaction = await jetpacks.connect(deployer).addToWhitelist(user.address)
        await transaction.wait()

        transaction = await jetpacks.connect(user).mint(1, { value: ether(.01) })
        await transaction.wait()

        transaction = await jacdDAO.connect(deployer).createProposal(user.address, tokens(.1), 'Prop 1')
        await transaction.wait()

        transaction = await jacdDAO.connect(deployer).holdersVote(1, true)
        await transaction.wait()

        transaction = await jacdDAO.connect(user).holdersVote(1, false)
        await transaction.wait()
      })

      it('records holder votes', async () => {
        const proposal = await jacdDAO.proposals(1)
        expect(proposal.votesFor).to.equal(6666)
        expect(proposal.votesAgainst).to.equal(66666)

        expect(await jacdDAO.holderVoted(1, deployer.address)).to.equal(true)
        expect(await jacdDAO.holderVoted(1, user.address)).to.equal(true)
      })

      it('emits a Vote event', async () => {
        await expect(transaction).to.emit(jacdDAO, 'Vote').withArgs(
          1,
          user.address,
          false,
          66666,
          (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp
        )
      })
    })

    describe('Failure', () => {
      beforeEach(async () => {
        transaction = await usdcToken.connect(user).approve(jacdDAO.target, AMOUNT)
        await transaction.wait()

        transaction = await jacdDAO.connect(user).receiveDeposit(AMOUNT)
        await transaction.wait()

        transaction = await avas.connect(deployer).addToWhitelist(deployer.address)
        await transaction.wait()

        transaction = await avas.connect(deployer).mint(1, { value: ether(.01) })
        await transaction.wait()

        transaction = await jacdDAO.connect(deployer).createProposal(user.address, tokens(.1), 'Prop 1')
        await transaction.wait()
      })

      it('rejects votes from non-holders', async () => {
        await expect(jacdDAO.connect(user).holdersVote(1, false)).to.be.reverted
      })

      // COME BACK TO THIS AFTER HOLDER FINALIZATION IS COMPLETE???
      it('rejects proposals not in holder stage', async () => {
      })

      it('rejects holders voting twice', async () => {
        transaction = await jacdDAO.connect(deployer).holdersVote(1, true)
        await transaction.wait()

        await expect(jacdDAO.connect(deployer).holdersVote(1, true)).to.be.reverted
      })

      it('rejects voting after end time', async () => {
        await time.increase(604801)

        await expect(jacdDAO.connect(deployer).holdersVote(1, true)).to.be.reverted
      })
    })
  })

  describe('Finalizing Holder Vote', () => {
    describe('Success', () => {
      beforeEach(async () => {
        transaction = await usdcToken.connect(user).approve(jacdDAO.target, AMOUNT)
        await transaction.wait()

        transaction = await jacdDAO.connect(user).receiveDeposit(AMOUNT)
        await transaction.wait()

        transaction = await jetpacks.connect(deployer).addToWhitelist(deployer.address)
        await transaction.wait()

        transaction = await hoverboards.connect(deployer).addToWhitelist(deployer.address)
        await transaction.wait()
      })

      describe('Passing Proposals', () => {
        beforeEach(async () => {
          transaction = await jetpacks.connect(deployer).mint(1111, { value: ether(11.11) })
          await transaction.wait()

          transaction = await hoverboards.connect(deployer).mint(3334, { value: ether(33.34) })
          await transaction.wait()

          transaction = await jacdDAO.connect(deployer).createProposal(user.address, tokens(.1), 'Prop 1')
          await transaction.wait()
        })

        it('allows proposals with all votes submitted to be finalized', async () => {
          transaction = await avas.connect(deployer).addToWhitelist(deployer.address)
          await transaction.wait()

          transaction = await hoverboards.connect(deployer).mint(3332, {value: ether(33.32)})
          await transaction.wait()

          transaction = await avas.connect(deployer).mint(11111, {value: ether(111.11)})
          await transaction.wait()

          transaction = await jacdDAO.connect(deployer).holdersVote(1, true)
          await transaction.wait()

          transaction = await jacdDAO.connect(deployer).finalizeHoldersVote(1)
          await transaction.wait()

          await expect(transaction).to.emit(jacdDAO, 'VotePass')
        })

        it('resets proposal for next voting stage', async () => {
          transaction = await jacdDAO.connect(deployer).holdersVote(1, true)
          await transaction.wait()

          time.increase(604801)

          transaction = await jacdDAO.connect(deployer).finalizeHoldersVote(1)
          await transaction.wait()

          let proposal = await jacdDAO.proposals(1)

          expect(proposal.stage).to.equal(1)
          expect(proposal.votesFor).to.equal(0)
          expect(proposal.votesAgainst).to.equal(0)
          expect(proposal.voteEnd).to.equal(
            (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp + 1209599
          )
        })

        it('emits a VotePass event', async () => {
          transaction = await jacdDAO.connect(deployer).holdersVote(1, true)
          await transaction.wait()

          time.increase(604801)

          transaction = await jacdDAO.connect(deployer).finalizeHoldersVote(1)
          await transaction.wait()

          await expect(transaction).to.emit(jacdDAO, 'VotePass').withArgs(
            1,
            0,
            111110000,
            0
          )
        })
      })

      describe('Failing Proposals', () => {
        it('fails a proposal with less than 50% total votes', async () => {
          transaction = await jetpacks.connect(deployer).mint(1, { value: ether(.01) })
          await transaction.wait()

          transaction = await jacdDAO.connect(deployer).createProposal(user.address, tokens(.1), 'Prop 1')
          await transaction.wait()

          transaction = await jacdDAO.connect(deployer).holdersVote(1, true)
          await transaction.wait()

          time.increase(604801)

          transaction = await jacdDAO.connect(deployer).finalizeHoldersVote(1)
          await transaction.wait()

          let proposal = await jacdDAO.proposals(1)
          expect(proposal.stage).to.equal(3)
        })

        it('fails a proposal with majority down votes', async () => {
          transaction = await jetpacks.connect(deployer).mint(1111, { value: ether(11.11) })
          await transaction.wait()

          transaction = await hoverboards.connect(deployer).mint(3334, { value: ether(40) })
          await transaction.wait()

          transaction = await jacdDAO.connect(deployer).createProposal(user.address, tokens(.1), 'Prop 1')
          await transaction.wait()

          transaction = await jacdDAO.connect(deployer).holdersVote(1, false)
          await transaction.wait()

          time.increase(604801)

          transaction = await jacdDAO.connect(deployer).finalizeHoldersVote(1)
          await transaction.wait()

          let proposal = await jacdDAO.proposals(1)
          expect(proposal.stage).to.equal(3)
        })
      })
    })

    describe('Failure', () => {
      beforeEach(async () => {
        transaction = await usdcToken.connect(user).approve(jacdDAO.target, AMOUNT)
        await transaction.wait()

        transaction = await jacdDAO.connect(user).receiveDeposit(AMOUNT)
        await transaction.wait()

        transaction = await jetpacks.connect(deployer).addToWhitelist(deployer.address)
        await transaction.wait()

        transaction = await hoverboards.connect(deployer).addToWhitelist(deployer.address)
        await transaction.wait()

        transaction = await jetpacks.connect(deployer).mint(1, { value: ether(.01) })
        await transaction.wait()

        transaction = await jacdDAO.connect(deployer).createProposal(user.address, tokens(.1), 'Prop 1')
        await transaction.wait()
      })
      it('prevents finalization before end time is reached', async () => {
        transaction = await jacdDAO.connect(deployer).holdersVote(1, true)
        await transaction.wait()

        await expect(jacdDAO.connect(deployer).finalizeHoldersVote(1)).to.be.reverted
      })

      it('rejects finalization of proposals not in holders stage', async () => {
        transaction = await jetpacks.connect(deployer).mint(1110, { value: ether(11.11) })
        await transaction.wait()

        transaction = await hoverboards.connect(deployer).mint(3334, { value: ether(33.34) })
        await transaction.wait()

        transaction = await jacdDAO.connect(deployer).createProposal(user.address, tokens(.1), 'Prop 1')
        await transaction.wait()

        transaction = await jacdDAO.connect(deployer).holdersVote(1, true)
        await transaction.wait()

        time.increase(604801)

        transaction = await jacdDAO.connect(deployer).finalizeHoldersVote(1)
        await transaction.wait()

        await expect(jacdDAO.connect(deployer).finalizeHoldersVote(1)).to.be.reverted
      })
    })
  })
})
