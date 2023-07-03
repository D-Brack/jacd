import { ethers } from 'ethers'

import { setConnection, setChainId, setAccount } from './reducers/provider'

export const loadProvider = (dispatch) => {
  console.log(window.ethereum)
  const provider = new ethers.BrowserProvider(window.ethereum)

  dispatch(setConnection(provider))
  return provider
}

export const loadChainId = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork()

  console.log(chainId.toString())

  dispatch(setChainId(chainId.toString()))
  return chainId
}

export const loadAccount = async (dispatch) => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  const account = ethers.getAddress(accounts[0])
  dispatch(setAccount(account))

  return account
}

