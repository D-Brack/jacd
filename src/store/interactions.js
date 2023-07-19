import { ethers } from 'ethers'
import config from '../config.json'

import TOKEN_ABI from '../abis/JACDToken.json'
import DAO_ABI from '../abis/JACD.json'
import NFT_ABI from '../abis/NFT.json'

import provider, {
  setConnection,
  setChainId,
  setAccount
} from './reducers/provider'

import {
  setContracts,
  setSymbols,
  setBalances
} from './reducers/tokens'

import {
  setContract,
  setUSDCBalance,
  setJACDSupply,
  setMaxProposalAmountPercent,
  setHoldersWeight,
  setHolderVotes,
  setMinHolderVotesToPass,
  setMinVotesToFinalize,
  setProposals,
  setHolderProposals,
  setHolderVoteStatus,
  setOpenProposals,
  setHolderOpenVoteStatus,
  setClosedProposals
} from './reducers/dao'

import {
  setCollections,
  setNames,
  setNFTBalances
} from './reducers/nfts'


//-----------------------------------------------------------------
/* #region Network Info */

export const loadProvider = (dispatch) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)

  dispatch(setConnection(provider))
  return provider
}

export const loadChainId = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork()

  dispatch(setChainId(chainId.toString()))
  return chainId
}

export const loadAccount = async (dispatch) => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  const account = accounts[0]

  dispatch(setAccount(account))
  return account
}
/* #endregion */

//-----------------------------------------------------------------
/* #region Token Info */

export const loadTokenContracts = async (chainId, provider, dispatch) => {
  console.log('in loadTokensContracts', chainId)
  const jacdToken = new ethers.Contract(config[chainId].jacdToken.address, TOKEN_ABI, provider)
  const usdcToken = new ethers.Contract(config[chainId].usdcToken.address, TOKEN_ABI, provider)

  dispatch(setContracts([jacdToken, usdcToken]))
  dispatch(setSymbols([await jacdToken.symbol(), await usdcToken.symbol()]))
  return([jacdToken, usdcToken])
}

export const loadUserBalances = async (tokens, account, dispatch) => {
  const jacdBalance = ethers.utils.formatUnits(await tokens[0].balanceOf(account), 'ether')
  const usdcBalance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 'ether')

  dispatch(setBalances([jacdBalance, usdcBalance]))
  return([jacdBalance, usdcBalance])
}
/* #endregion */

//-----------------------------------------------------------------
/* #region DAO Info */

export const loadDAOContract = async (tokens, chainId, provider, dispatch) => {
  const dao = new ethers.Contract(config[chainId].jacdDAO.address, DAO_ABI, provider)

  dispatch(setContract(dao))
  dispatch(setMaxProposalAmountPercent((await dao.maxProposalAmountPercent()).toString()))
  dispatch(setHolderVotes((await dao.holderVotes()).toString()))
  dispatch(setHoldersWeight((await dao.holdersWeight()).toString()))
  dispatch(setMinHolderVotesToPass((await dao.minHolderVotesToPass()).toString()))
  dispatch(setMinVotesToFinalize((await dao.minVotesToFinalize()).toString()))
  return dao
}

export const loadDAOBalances = async (tokens, dao, dispatch) => {
  const usdcBalance = ethers.utils.formatUnits(await tokens[1].balanceOf(dao.address), 'ether')
  const jacdSupply = ethers.utils.formatUnits(await tokens[0].totalSupply(), 'ether')

  dispatch(setUSDCBalance(usdcBalance))
  dispatch(setJACDSupply(jacdSupply))
  return([usdcBalance, jacdSupply])
}

export const loadProposals = async (dao, dispatch) => {
  const count = await dao.proposalCount()
  let proposals = []
  let proposal

  for(let i = 1; i <= count; i++) {
    proposals.push(await dao.proposals(i))
  }

  dispatch(setProposals(proposals))
  return proposals
}

export const loadHolderProposals = (proposals, dispatch) => {
  let holderProposals = []

  for(let i = 0; i < proposals.length; i++) {
    if (proposals[i].stage === 0) {
      holderProposals.push(proposals[i])
    }
  }

  dispatch(setHolderProposals(holderProposals))
  return holderProposals
}

export const loadHolderVoteStatus = async (dao, holderProposals, account, dispatch) => {
  let voteStatus = []
  let index

  for(let i = 0; i < holderProposals.length; i++) {
    index = holderProposals[i].index
    voteStatus.push(await dao.holderVoted(index, account))
  }

  dispatch(setHolderVoteStatus(voteStatus))
  return voteStatus
}

export const loadOpenProposals = (proposals, dispatch) => {
  let openProposals = []

  for(let i = 0; i < proposals.length; i++) {
    if (proposals[i].stage === 1) {
      openProposals.push(proposals[i])
    }
  }

  dispatch(setOpenProposals(openProposals))
  return openProposals
}

export const loadHolderOpenVoteStatus = async (dao, openProposals, account, dispatch) => {
  let voteStatus = []
  let index

  for(let i = 0; i < openProposals.length; i++) {
    index = openProposals[i].index
    voteStatus.push(await dao.holderOpenVoted(openProposals[i].index, account))
  }

  dispatch(setHolderOpenVoteStatus(voteStatus))
  return voteStatus
}

export const loadClosedProposals = (proposals, dispatch) => {
  let closedProposals = []

  for(let i = 0; i < proposals.length; i++) {
    if (proposals[i].stage === 2 || proposals[i].stage === 3) {
      closedProposals.push(proposals[i])
    }
  }

  dispatch(setClosedProposals(closedProposals))
  return closedProposals
}
/* #endregion */

//-----------------------------------------------------------------
/* #region NFT Info */

export const loadNFTContracts = async (provider, dao, dispatch) => {
  const collections = await dao.getCollections()
  let nfts = []
  let names = []
  let balances = []

  for(let i = 0; i < collections.length; i++) {
    nfts.push(new ethers.Contract(collections[i], NFT_ABI, provider))
    names.push(await nfts[i].name())
  }

  dispatch(setCollections(nfts))
  dispatch(setNames(names))
  return([nfts, names])
}

export const loadNFTBalances = async (nfts, account, dispatch) => {
  let nftBalances = []
  for(let i = 0; i < nfts.length; i++) {
    nftBalances.push((await nfts[i].balanceOf(account)).toString())
  }

  dispatch(setNFTBalances(nftBalances))
  return nftBalances
}
/* #endregion */

//-----------------------------------------------------------------
/* #region Form & Vote Submissions */

export const submitDonation = async (provider, dao, tokens, amount) => {
  try {
    let transaction

    amount = ethers.utils.parseUnits(amount, 'ether')

    const signer = provider.getSigner()

    transaction = await tokens[1].connect(signer).approve(dao.address, amount)
    await transaction.wait()

    transaction = await dao.connect(signer).receiveDeposit(amount)
    await transaction.wait()

  } catch (error) {
    window.alert('Donation Submission Failed')
  }
}

export const createProposal = async (provider, dao, recipient, amount, description, dispatch) => {
  try {
    let transaction

    amount = ethers.utils.parseUnits(amount, 'ether')

    const signer = provider.getSigner()

    transaction = await dao.connect(signer).createProposal(recipient, amount, description)
    await transaction.wait()

  } catch (error) {
    window.alert('New proposal not recorded')
  }
}

export const submitHoldersVote = async (provider, dao, index, voteFor) => {
  try {
    let transaction

    const signer = provider.getSigner()

    transaction = await dao.connect(signer).holdersVote(index, voteFor)
    await transaction.wait()

  } catch (error) {
    window.alert('Votes submission failed')
  }
}

export const finalizeHoldersVote = async (provider, dao, index) => {
  try {
    let transaction

    const signer = provider.getSigner()

    transaction = await dao.connect(signer).finalizeHoldersVote(index)
    await transaction.wait()

  } catch (error) {
    window.alert('Holders stage finalization failed')
  }
}

export const submitOpenVote = async (provider, dao, tokens, index, voteFor, jacdVotes) => {
  try {
    let transaction

    const signer = provider.getSigner()

    if(jacdVotes > 0) {
      jacdVotes = ethers.utils.parseUnits(jacdVotes.toString(), 'ether')

      console.log(jacdVotes)

      transaction = await tokens[0].connect(signer).approve(dao.address, jacdVotes)
      await transaction.wait()
    }

    transaction = await dao.connect(signer).openVote(index, voteFor, jacdVotes)
    await transaction.wait()

  } catch (error) {
    window.alert('Votes submission failed')
  }
}

export const finalizeProposal = async (provider, dao, index) => {
  try {
    let transaction

    const signer = provider.getSigner()

    transaction = await dao.connect(signer).finalizeProposal(index)
    await transaction.wait()

  } catch (error) {
    window.alert('Proposal failed to finalize')
  }
}
/* #endregion */
