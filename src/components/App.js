import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { HashRouter, Routes, Route } from 'react-router-dom'

import Container from 'react-bootstrap/Container'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import Navigation from './Navigation'
import TabNav from './TabNav'
import Info from './Info'
import CreateProp from './CreateProp'
import HolderVote from './HolderVote'
import OpenVote from './OpenVote'
import History from './History'
import Faucet from './Faucet'

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
  const [onChain, setOnChain] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

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
        //setOnChain(false)
        setShowAlert(true)
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
    setShowAlert(false)
    setOnChain(false)
    await loadBlockchainData()
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
                <Route path='/create_proposal' element={<CreateProp setIsLoading={setIsLoading} />}></Route>
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
            <p className='my-2'>Waiting for connection to the blockchain network...</p>
          </div>
        )}

        {showAlert && (
          <Alert className='mx-auto' style={{ maxWidth: '400px' }} dismissible variant='danger' >
            <Alert.Heading>Wrong Network</Alert.Heading>
            <hr />
            <p>Please connect to Sepolia network.</p>
          </Alert>)}
    </Container>
  );
}

export default App;
