import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { ethers } from 'ethers'

import Container from 'react-bootstrap/Container'
import Spinner from 'react-bootstrap/Spinner'
import Navigation from './Navigation'
import TabNav from './TabNav'
import Info from './Info'
import CreateProp from './CreateProp'
import HolderVote from './HolderVote'
import OpenVote from './OpenVote'
import History from './History'

import {
  loadProvider,
  loadChainId,
  loadAccount,
  loadTokenContracts,
  loadDAOContract,
  loadDAOBalances,
  loadProposals,
  loadHolderProposals,
  loadOpenProposals,
  loadNFTContracts,
  loadClosedProposals
} from '../store/interactions'
import Faucet from './Faucet'

function App() {
  const dispatch = useDispatch()

  const [isLoading, setIsLoading] = useState(true)
  const [onChain, setOnChain] = useState(true)

  const loadBlockchainData = async () => {
    setIsLoading(true)

    const provider = await loadProvider(dispatch)
    const chainId = await loadChainId(provider, dispatch)

    if(chainId === 31337) {
      setOnChain(true)

      const tokens = await loadTokenContracts(chainId, provider, dispatch)
      const dao = await loadDAOContract(tokens, chainId, provider, dispatch)
      const daoBalances = await loadDAOBalances(tokens, dao, dispatch)
      const proposals = await loadProposals(dao, dispatch)
      const holderProposals = await loadHolderProposals(proposals, dispatch)
      const openProposals = await loadOpenProposals(proposals, dispatch)
      const closedProposals = await loadClosedProposals(proposals, dispatch)
      const nfts = await loadNFTContracts(provider, dao, dispatch)
    } else {
        setOnChain(false)
        window.alert('Please connect wallet to Sepolia chain.')
    }

    setIsLoading(false)
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  window.ethereum.on('accountsChanged', async () => {
    await loadAccount(dispatch)
  })

  window.ethereum.on('networkChanged', async () => {
    loadBlockchainData()
  })

  return (
    <Container>
        {onChain ? (
          <HashRouter>
            <Navigation />

            <hr />

            <TabNav />

            {isLoading ? (
              <div className='text-center my-5'>
                <Spinner animation="grow" />
                <p className='my-2'>Loading Data...</p>
              </div>
            ) : (
              <Routes>
                <Route exact path='/' element={<Info />}></Route>
                <Route path='/create_proposal' element={<CreateProp />}></Route>
                <Route path='/holder_voting' element={<HolderVote />}></Route>
                <Route path='/open_voting' element={<OpenVote />}></Route>
                <Route path='/history' element={<History />}></Route>
              </Routes>
            )}

            <hr />

            <Faucet />
          </HashRouter>
        ) : (
          <div className='text-center my-5'>
            <Spinner animation="grow" />
            <p className='my-2'>Connecting to the blockchain network...</p>
          </div>
        )}
    </Container>
  );
}

export default App;
