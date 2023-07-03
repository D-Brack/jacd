import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

import { useSelector, useDispatch } from 'react-redux'
import { loadAccount } from '../store/interactions'

import logo from '../logo.svg'
import { Nav } from 'react-bootstrap'

const Navigation = () => {
  const dispatch = useDispatch()
  const account = useSelector(state => state.provider.account)

  const connectHandler = () => {}

  return(
    <Navbar className='my-3'>
      <Navbar.Brand className='align-center' href='#'>JADU Avas Charitable DAO</Navbar.Brand>
      <Navbar.Collapse className='justify-content-end'>
        <div className='d-flex justify-content-end'>
          {account ? (
            <Navbar.Text>{account.slice(0, 5)}...{account.slice(-4)}</Navbar.Text>
          ) : (
            <Button onClick={() => loadAccount(dispatch)}>Connect Wallet</Button>
          )}
        </div>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default Navigation
