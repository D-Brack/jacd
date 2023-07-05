import { ethers } from 'ethers'
import config from '../config.json'

import TOKEN_ABI from '../abis/JACDToken.json'
import DAO_ABI from '../abis/JACD.json'

import {
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
  setProposals
} from './reducers/dao'


//-----------------------------------------------------------------
// Load Network Info
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

//-----------------------------------------------------------------
// Load Token Info

export const loadTokenContracts = async (chainId, provider, dispatch) => {
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

//-----------------------------------------------------------------
// Load DAO Info

export const loadDAOContract = async (tokens, chainId, provider, dispatch) => {
  const jacdDAO = new ethers.Contract(config[chainId].jacdDAO.address, DAO_ABI, provider)

  dispatch(setContract(jacdDAO))
  return jacdDAO
}

export const loadDAOBalances = async (tokens, dao, dispatch) => {
  const usdcBalance = ethers.utils.formatUnits(await tokens[1].balanceOf(dao.address), 'ether')
  const jacdSupply = ethers.utils.formatUnits(await tokens[0].totalSupply(), 'ether')

  console.log({usdcBalance, jacdSupply})

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

//-----------------------------------------------------------------
// Load NFT Info

export const loadNFTContracts = async (chainId, provider, dispatch) => {

}
