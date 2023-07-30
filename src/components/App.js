/* #region Dependencies */

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
/* #endregion */

function App() {

  /* #region Component Variables */
  const dispatch = useDispatch()

  const [isLoading, setIsLoading] = useState(true)
  const [onChain, setOnChain] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  /* #endregion */

  /* #region Component Functions */

  const loadBlockchainData = async () => {
    setIsLoading(true)

    const provider = await loadProvider(dispatch)
    const chainId = await loadChainId(provider, dispatch)

    if(chainId === 31337) {
      setOnChain(true)

      const tokens = await loadTokenContracts(chainId, provider, dispatch)
      const dao = await loadDAOContract(tokens, chainId, provider, dispatch)
      await loadDAOBalances(tokens, dao, dispatch)
      const proposals = await loadProposals(dao, dispatch)
      await loadHolderProposals(proposals, dispatch)
      await loadOpenProposals(proposals, dispatch)
      await loadClosedProposals(proposals, dispatch)
      await loadNFTContracts(provider, dao, dispatch)
    } else {
        //setOnChain(false)
        setShowAlert(true)
    }

    setIsLoading(false)
  }
  /* #endregion */

  /* #region Hooks */

  useEffect(() => {
    loadBlockchainData()
  }, [])
  /* #endregion */

  /* #region Event Listeners */

  window.ethereum.on('accountsChanged', async () => {
    await loadAccount(dispatch)
  })

  window.ethereum.on('networkChanged', async () => {
    setShowAlert(false)
    setOnChain(false)
    await loadBlockchainData()
  })
  /* #endregion */

  return (
    <Container>
      {showAlert && (
        <Alert className='mx-auto my-5' style={{ maxWidth: '400px' }} dismissible variant='danger' >
          <Alert.Heading>Wrong Network</Alert.Heading>
          <hr />
          <p>Please connect to Sepolia network.</p>
        </Alert>
      )}

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

          <Faucet />
        </HashRouter>
      ) : (
        <div className='text-center my-5'>
          <Spinner animation="grow" />
          <p className='my-2'>Waiting for connection to the blockchain network...</p>
        </div>
      )}
    </Container>
  );
}

export default App;
