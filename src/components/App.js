import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { HashRouter, Routes, Route } from 'react-router-dom'

import Container from "react-bootstrap/Container";
import Navigation from "./Navigation";
import TabNav from './TabNav'
import Info from './Info'
import CreateProp from "./CreateProp";
import HolderVote from "./HolderVote";
import OpenVote from "./OpenVote";
import History from "./History";

import {
  loadProvider,
  loadChainId,
  loadTokenContracts,
  loadDAOContract,
  loadDAOBalances,
  loadProposals
} from '../store/interactions'

function App() {
  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    const provider = await loadProvider(dispatch)
    const chainId = await loadChainId(provider, dispatch)
    const tokens = await loadTokenContracts(chainId, provider, dispatch)
    const jacdDAO = await loadDAOContract(tokens, chainId, provider, dispatch)
    const daoBalances = await loadDAOBalances(tokens, jacdDAO, dispatch)
    const proposals = await loadProposals(jacdDAO, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <Container>
      <HashRouter>
        <Navigation />

        <hr />

        <TabNav />

        <Routes>
          <Route exact path='/' element={<Info />}></Route>
          <Route path='/create_proposal' element={<CreateProp />}></Route>
          <Route path='/holder_voting' element={<HolderVote />}></Route>
          <Route path='/open_voting' element={<OpenVote />}></Route>
          <Route path='/history' element={<History />}></Route>
        </Routes>
      </HashRouter>
    </Container>
  );
}

export default App;
