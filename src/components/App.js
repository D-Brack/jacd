import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { HashRouter, Routes, Route } from 'react-router-dom'

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

function App() {
  const dispatch = useDispatch()

  const [isLoading, setIsLoading] = useState(true)

  const loadBlockchainData = async () => {
    setIsLoading(true)

    const provider = await loadProvider(dispatch)
    const chainId = await loadChainId(provider, dispatch)
    const tokens = await loadTokenContracts(chainId, provider, dispatch)
    const dao = await loadDAOContract(tokens, chainId, provider, dispatch)
    const daoBalances = await loadDAOBalances(tokens, dao, dispatch)
    const proposals = await loadProposals(dao, dispatch)
    const holderProposals = await loadHolderProposals(proposals, dispatch)
    const openProposals = await loadOpenProposals(proposals, dispatch)
    const nfts = await loadNFTContracts(provider, dao, dispatch)
    const closedProposals = await loadClosedProposals(proposals, dispatch)

    setIsLoading(false)
  }

  useEffect(() => {
    if(isLoading) {
      loadBlockchainData()
    }
  }, [isLoading]);

  window.ethereum.on('accountsChanged', async () => {
    await loadAccount(dispatch)
  })

  return (
    <Container>
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

      </HashRouter>
    </Container>
  );
}

export default App;
