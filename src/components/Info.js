import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import CardGroup from 'react-bootstrap/CardGroup'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import Spinner from 'react-bootstrap/Spinner'

import {
  loadUserBalances,
  loadDAOBalances,
  submitDonation
} from '../store/interactions'

const Info = () => {
  const dispatch = useDispatch()

  const [amount, setAmount] = useState(0)
  const [isWaiting, setIsWaiting] = useState(0)

  const provider = useSelector((state) => state.provider.connection)
  const account = useSelector((state) => state.provider.account)
  const tokens = useSelector((state) => state.tokens.contracts)
  const symbols = useSelector((state) => state.tokens.symbols)
  const balances = useSelector((state) => state.tokens.balances)
  const usdcBalance = useSelector((state) => state.dao.usdcBalance)
  const jacdSupply = useSelector((state) => state.dao.jacdSupply)
  const dao = useSelector((state) => state.dao.contract)
  const proposals = useSelector((state) => state.dao.proposals)
  const holderProposals = useSelector((state) => state.dao.holderProposals)
  const openProposals = useSelector((state) => state.dao.openProposals)
  const names = useSelector((state) => state.nfts.names)
  const nftBalances = useSelector((state) => state.nfts.nftBalances)

  const donateHandler = async (e) => {
    e.preventDefault()
    setIsWaiting(true)

    await submitDonation(provider, dao, tokens, amount)

    await loadDAOBalances(tokens, dao, dispatch)
    await loadUserBalances(tokens, account, dispatch)

    setAmount(0)
    setIsWaiting(false)
  }

  return(
    <CardGroup className='mx-auto my-4' style={{maxWidth: '1000px'}}>
      <Card style={{maxWidth: '500px'}}>
        <Card.Header as='h3' >DAO Info</Card.Header>
        <Card.Body>
          <Card.Title as='h4'>Token Info</Card.Title>
          <Card.Text><strong>{symbols[1]} Balance: </strong>{usdcBalance}</Card.Text>
          <Card.Text><strong>Outstanding {symbols[0]} Votes: </strong>{jacdSupply}</Card.Text>
          <Card.Text><strong>Total Proposals Submitted: </strong>{proposals.length}</Card.Text>
          <Card.Text>
            <strong>Currently Active Proposals: </strong>{holderProposals.length + openProposals.length}<br />
            <span>Holders only voting stage: {holderProposals.length}<br /></span>
            <span>Open voting stage: {openProposals.length}</span>
          </Card.Text>

          <hr />

          <Card.Title as='h3'>Donate Now!</Card.Title>

          <Form onSubmit={donateHandler}>
            <Form.Group className='my-3'>
              <Form.Label>Amount</Form.Label>
              <InputGroup>
                <Form.Control type='number' step='any' required onChange={(e) => setAmount(e.target.value)} value={amount} min={1}></Form.Control>
                <InputGroup.Text>{symbols[1]}</InputGroup.Text>
              </InputGroup>
            </Form.Group>
            {isWaiting ? (
              <Spinner animation='border' className='d-block mx-auto' />
            ) : (
              <Button style={{width: '100%'}} disabled={!account} type='submit' >
                {account ? 'Donate' : 'Connect Wallet'}
              </Button>
            )}
            <p style={{color: 'red', marginTop: '8px'}}>***Receive 1 {symbols[0]} vote for each {symbols[1]} donated***</p>
          </Form>
        </Card.Body>
      </Card>

      <Card style={{maxWidth: '500px'}}>
        <Card.Header as='h3' >Your Info</Card.Header>
        {account ? (
          <Card.Body>
            <Card.Title as='h4'>Token Balances</Card.Title>
            <Card.Text><strong>{symbols[1]} Balance: </strong>{balances[1]}</Card.Text>
            <Card.Text><strong>Available {symbols[0]} Votes: </strong>{balances[0]}</Card.Text>

            <hr />

            <Card.Title as='h4'>NFT Balances</Card.Title>
            {names.map((name, index) => (
              <Card.Text key={index}><strong>{name}: </strong>{nftBalances[index]}</Card.Text>
            ))}
          </Card.Body>
        ) : (
          <Card.Body>
            <p>Please connect your wallet.</p>
          </Card.Body>
        )}
      </Card>
    </CardGroup>
  )
}

export default Info
