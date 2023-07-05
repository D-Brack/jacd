import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button'

import { useSelector, useDispatch } from 'react-redux'
import { loadAccount, loadUserBalances } from '../store/interactions'

const Navigation = () => {
  const dispatch = useDispatch()

  const account = useSelector(state => state.provider.account)
  const tokens = useSelector(state => state.tokens.contracts)

  const connectHandler = async () => {
    const account = await loadAccount(dispatch)
    const balances = await loadUserBalances(tokens, account, dispatch)
  }

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
