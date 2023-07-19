import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button'

import { useSelector, useDispatch } from 'react-redux'
import {
  loadAccount,
  loadUserBalances,
  loadNFTBalances,
  loadHolderVoteStatus,
  loadHolderOpenVoteStatus
} from '../store/interactions'
import { useEffect } from 'react'

const Navigation = () => {
  const dispatch = useDispatch()

  const account = useSelector((state) => state.provider.account)
  const tokens = useSelector((state) => state.tokens.contracts)
  const nfts = useSelector((state) => state.nfts.collections)
  const dao = useSelector((state) => state.dao.contract)
  const holderProposals = useSelector((state) => state.dao.holderProposals)
  const openProposals = useSelector((state) => state.dao.openProposals)

  const connectHandler = async () => {
    let address = await loadAccount(dispatch)
    await loadUserBalances(tokens, address, dispatch)
    await loadNFTBalances(nfts, address, dispatch)
    await loadHolderVoteStatus(dao, holderProposals, address, dispatch)
    await loadHolderOpenVoteStatus(dao, openProposals, address, dispatch)
  }

  useEffect(() => {
    if(account) {
      connectHandler()
    }
  }, [account])

  return(
    <Navbar className='my-3'>
      <Navbar.Brand className='align-center' href='#'>JADU Avas Charitable DAO</Navbar.Brand>
      <Navbar.Collapse className='justify-content-end'>
        <div className='d-flex justify-content-end'>
          {account ? (
            <Navbar.Text>{account.slice(0, 5)}...{account.slice(-4)}</Navbar.Text>
          ) : (
            <Button onClick={connectHandler}>Connect Wallet</Button>
          )}
        </div>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default Navigation
