const { expect } = require('chai')
const { ethers } = require('hardhat')
const { time } = require('@nomicfoundation/hardhat-toolbox/network-helpers')

const tokens = (amount) => {
  return ethers.parseUnits(amount.toString(), 'ether')
}

const ether = tokens

describe('JACD', () => {
  const AMOUNT = tokens(100)

  let
    jacdDAO,
    jacdToken,
    usdcToken,
    collections,
    deployer,
    holder,
    investor,
    rando
  let transaction, result

  beforeEach(async () => {
    const accounts = await ethers.getSigners()
    deployer = accounts[0]
    holder = accounts[1]
    investor = accounts[2]
    rando = accounts[3]

    const JACDToken = await ethers.getContractFactory('JACDToken')
    jacdToken = await JACDToken.deploy('JACD Coin', 'JACD')

    const USDCToken = await ethers.getContractFactory('JACDToken')
    usdcToken = await USDCToken.deploy('USD Coin', 'USDC')

    transaction = await usdcToken.connect(deployer).mint(investor.address, AMOUNT)
    await transaction.wait()

    const Jetpacks = await ethers.getContractFactory('NFT')
    jetpacks = await Jetpacks.deploy(
      'Jetpacks',
      'JP',
      ether(.01),
      1,
      Date.now().toString().slice(0, 10),
      'x',
      1
    )

    const Hoverboards = await ethers.getContractFactory('NFT')
    hoverboards = await Hoverboards.deploy(
      'Hoverboards',
      'HB',
      ether(.01),
      2,
      Date.now().toString().slice(0, 10),
      'y',
      2
    )

    const AVAs = await ethers.getContractFactory('NFT')
    avas = await AVAs.deploy(
      'AVAs',
      'AVA',
      ether(.01),
      3,
      Date.now().toString().slice(0, 10),
      'z',
      3
    )

    const collections = [jetpacks.target, hoverboards.target, avas.target]

    const JACDDAO = await ethers.getContractFactory('JACD')
    jacdDAO = await JACDDAO.deploy(jacdToken.target, usdcToken.target, collections)

    transaction = await jacdToken.connect(deployer).transferOwnership(jacdDAO)
    await transaction.wait()

    transaction = await usdcToken.connect(investor).approve(jacdDAO.target, AMOUNT)
    await transaction.wait()

    transaction = await jacdDAO.connect(investor).receiveDeposit(AMOUNT)
    await transaction.wait()
  })

  describe('Deployment', () => {
    it('initializes token contracts', async () => {
      expect(await jacdDAO.jacdToken()).to.equal(jacdToken.target)
      expect(await jacdDAO.usdcToken()).to.equal(usdcToken.target)
    })

    it('initializes NFT collection contracts', async () => {
      let collections = await jacdDAO.getCollections()

      expect(await jacdDAO.collectionsLength()).to.equal(3)
      expect(collections[0]).to.equal(jetpacks.target)
      expect(collections[1]).to.equal(hoverboards.target)
      expect(collections[2]).to.equal(avas.target)
    })
  })

  describe('Receiving Deposits', () => {
    describe('Success', () => {
      it('accepts token deposits', async () => {
        expect(await usdcToken.balanceOf(investor.address)).to.equal(0)
        expect(await usdcToken.balanceOf(jacdDAO.target)).to.equal(AMOUNT)
        expect(await jacdDAO.usdcBalance()).to.equal(AMOUNT)
      })

      it('distributes JACD tokens', async () => {
        expect(await jacdToken.balanceOf(investor.address)).to.equal(AMOUNT)
        expect(await jacdDAO.jacdSupply()).to.equal(AMOUNT)
      })

      it('emits a Deposit event', async () => {
        await expect(transaction).to.emit(jacdDAO, 'Deposit').withArgs(
          investor.address,
          AMOUNT,
          (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp
        )
      })
    })

    describe('Failure', () => {
      it('rejects deposits of 0', async () => {
        transaction = await usdcToken.connect(deployer).mint(investor.address, AMOUNT)
        await transaction.wait()

        transaction = await usdcToken.connect(investor).approve(jacdDAO.target, AMOUNT)
        await transaction.wait()

        await expect(jacdDAO.connect(investor).receiveDeposit(0)).to.be.reverted
      })
    })
  })

  describe('Creating Proposals', () => {
    describe('Success', () => {
      beforeEach(async () => {
        transaction = await avas.connect(deployer).addToWhitelist(holder.address)
        await transaction.wait()

        transaction = await avas.connect(holder).mint(1, { value: ether(.01) })
        await transaction.wait()

        transaction = await jacdDAO.connect(holder).createProposal(rando.address, tokens(10), 'Prop 1')
        await transaction.wait()
      })

      it('creates & stores a new proposal', async () => {
        expect(await jacdDAO.proposalCount()).to.equal(1)

        const proposal = await jacdDAO.proposals(1)
        expect(proposal.index).to.equal(1)
        expect(proposal.recipient).to.equal(rando.address)
        expect(proposal.amount).to.equal(tokens(10))
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
          rando.address,
          tokens(10),
          'Prop 1',
          holder.address,
          (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp
        )
      })
    })

    describe('Failure', () => {
      beforeEach(async () => {
        transaction = await avas.connect(deployer).addToWhitelist(holder.address)
        await transaction.wait()

        transaction = await avas.connect(holder).mint(1, { value: ether(.01) })
        await transaction.wait()
      })

      it('rejects proposals from non-holders/non-investors', async () => {
        await expect(jacdDAO.connect(rando).createProposal(
          deployer.address,
          tokens(10),
          'Prop 1'
        )).to.be.reverted
      })

      it('rejects proposals with amounts of 0', async () => {
        await expect(jacdDAO.connect(holder).createProposal(
          holder.address,
          0,
          'Prop 1'
        )).to.be.reverted
      })

      it('rejects proposals with amounts of over 10% of USDC balance', async () => {
        await expect(jacdDAO.connect(holder).createProposal(
          holder.address,
          tokens(10.01),
          'Prop 1'
        )).to.be.reverted
      })

      it('rejects proposals with no descritpion', async () => {
        await expect(jacdDAO.connect(holder).createProposal(
          holder.address,
          tokens(10),
          ''
        )).to.be.reverted
      })

      it('rejects proposals with invalid recipient address', async () => {
        await expect(jacdDAO.connect(holder).createProposal(
          '0x0000000000000000000000000000000000000000',
          tokens(10),
          'Prop 1'
        )).to.be.reverted
      })
    })
  })

  describe('Holder Voting', () => {
    beforeEach(async () => {
      transaction = await avas.connect(deployer).addToWhitelist(deployer.address)
      await transaction.wait()

      transaction = await avas.connect(deployer).mint(1, { value: ether(.01) })
      await transaction.wait()

      transaction = await jetpacks.connect(deployer).addToWhitelist(holder.address)
      await transaction.wait()

      transaction = await jetpacks.connect(holder).mint(1, { value: ether(.01) })
      await transaction.wait()

      transaction = await jacdDAO.connect(deployer).createProposal(rando.address, tokens(10), 'Prop 1')
      await transaction.wait()

    })

    describe('Success', () => {
      beforeEach(async () => {
        transaction = await jacdDAO.connect(deployer).holdersVote(1, true)
        await transaction.wait()

        transaction = await jacdDAO.connect(holder).holdersVote(1, false)
        await transaction.wait()
      })

      it('records holder votes', async () => {
        const proposal = await jacdDAO.proposals(1)
        expect(proposal.votesFor).to.equal(1)
        expect(proposal.votesAgainst).to.equal(1)

        expect(await jacdDAO.holderVoted(1, deployer.address)).to.equal(true)
        expect(await jacdDAO.holderVoted(1, holder.address)).to.equal(true)
      })

      it('emits a Vote event', async () => {
        await expect(transaction).to.emit(jacdDAO, 'Vote').withArgs(
          1,
          holder.address,
          false,
          1,
          (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp
        )
      })
    })

    describe('Failure', () => {
      it('rejects votes from non-holders', async () => {
        await expect(jacdDAO.connect(rando).holdersVote(1, false)).to.be.reverted
      })

      it('rejects proposals not in holder stage', async () => {
        transaction = await jacdDAO.connect(holder).holdersVote(1, true)
        await transaction.wait()

        transaction = await jacdDAO.connect(deployer).holdersVote(1, false)
        await transaction.wait()

        transaction = await jacdDAO.connect(deployer).finalizeHoldersVote(1)
        await transaction.wait()

        await expect(jacdDAO.connect(deployer).finalizeHoldersVote(1)).to.be.reverted
      })

      it('rejects holders voting twice', async () => {
        transaction = await jacdDAO.connect(holder).holdersVote(1, true)
        await transaction.wait()

        await expect(jacdDAO.connect(holder).holdersVote(1, true)).to.be.reverted
      })

      it('rejects voting after end time', async () => {
        await time.increase(604801)

        await expect(jacdDAO.connect(holder).holdersVote(1, true)).to.be.reverted
      })
    })
  })

  describe('Finalizing Holder Vote', () => {
    beforeEach(async () => {
      transaction = await jetpacks.connect(deployer).addToWhitelist(holder.address)
      await transaction.wait()

      transaction = await hoverboards.connect(deployer).addToWhitelist(deployer.address)
      await transaction.wait()

      transaction = await avas.connect(deployer).addToWhitelist(holder.address)
      await transaction.wait()

      transaction = await jetpacks.connect(holder).mint(1, { value: ether(.01) })
      await transaction.wait()

      transaction = await hoverboards.connect(deployer).mint(2, { value: ether(.02) })
      await transaction.wait()

      transaction = await avas.connect(holder).mint(3, { value: ether(.03) })
      await transaction.wait()
    })

    describe('Success', () => {
      describe('Passing Proposals', () => {
        beforeEach(async () => {
          transaction = await jacdDAO.connect(deployer).createProposal(rando.address, tokens(10), 'Prop 1')
          await transaction.wait()
        })

        it('allows proposals with all votes submitted to be finalized', async () => {
          transaction = await jacdDAO.connect(holder).holdersVote(1, true)
          await transaction.wait()

          transaction = await jacdDAO.connect(deployer).holdersVote(1, false)
          await transaction.wait()

          transaction = await jacdDAO.connect(holder).finalizeHoldersVote(1)
          await transaction.wait()

          await expect(transaction).to.emit(jacdDAO, 'VotePass')
        })

        it('resets proposal for next voting stage', async () => {
          transaction = await jacdDAO.connect(holder).holdersVote(1, true)
          await transaction.wait()

          time.increase(604801)

          transaction = await jacdDAO.connect(holder).finalizeHoldersVote(1)
          await transaction.wait()

          let proposal = await jacdDAO.proposals(1)

          expect(proposal.stage).to.equal(1)
          expect(proposal.votesFor).to.equal(0)
          expect(proposal.votesAgainst).to.equal(0)
          expect(proposal.voteEnd).to.equal(
            (await ethers.provider.getBlock(await ethers.provider.getBlockNumber()))
            .timestamp + 1209599
          )
        })

        it('emits a VotePass event', async () => {
          transaction = await jacdDAO.connect(holder).holdersVote(1, true)
          await transaction.wait()

          time.increase(604801)

          transaction = await jacdDAO.connect(holder).finalizeHoldersVote(1)
          await transaction.wait()

          await expect(transaction).to.emit(jacdDAO, 'VotePass').withArgs(
            1,
            0,
            4,
            0
          )
        })
      })

      describe('Failing Proposals', () => {
        it('fails a proposal with less than 50% total votes', async () => {
          transaction = await jacdDAO.connect(deployer).createProposal(rando.address, tokens(.1), 'Prop 1')
          await transaction.wait()

          transaction = await jacdDAO.connect(deployer).holdersVote(1, true)
          await transaction.wait()

          time.increase(604801)

          transaction = await jacdDAO.connect(holder).finalizeHoldersVote(1)
          await transaction.wait()

          let proposal = await jacdDAO.proposals(1)
          expect(proposal.stage).to.equal(3)
        })

        it('fails a proposal with majority down votes', async () => {
          transaction = await jacdDAO.connect(deployer).createProposal(rando.address, tokens(.1), 'Prop 1')
          await transaction.wait()

          transaction = await jacdDAO.connect(holder).holdersVote(1, false)
          await transaction.wait()

          time.increase(604801)

          transaction = await jacdDAO.connect(holder).finalizeHoldersVote(1)
          await transaction.wait()

          let proposal = await jacdDAO.proposals(1)
          expect(proposal.stage).to.equal(3)
        })
      })
    })

    describe('Failure', () => {
      beforeEach(async () => {
        transaction = await jacdDAO.connect(deployer).createProposal(rando.address, tokens(.1), 'Prop 1')
        await transaction.wait()
      })

      it('prevents finalization before end time is reached', async () => {
        transaction = await jacdDAO.connect(holder).holdersVote(1, true)
        await transaction.wait()

        await expect(jacdDAO.connect(holder).finalizeHoldersVote(1)).to.be.reverted
      })

      it('rejects finalization of proposals not in holders stage', async () => {
        transaction = await jacdDAO.connect(deployer).createProposal(rando.address, tokens(.1), 'Prop 1')
        await transaction.wait()

        transaction = await jacdDAO.connect(holder).holdersVote(1, true)
        await transaction.wait()

        transaction = await jacdDAO.connect(deployer).holdersVote(1, false)
        await transaction.wait()

        transaction = await jacdDAO.connect(holder).finalizeHoldersVote(1)
        await transaction.wait()

        await expect(jacdDAO.connect(holder).finalizeHoldersVote(1)).to.be.reverted
      })
    })
  })
})