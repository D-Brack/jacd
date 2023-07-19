import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import Spinner from 'react-bootstrap/Spinner'

import {
  createProposal,
  loadHolderProposals,
  loadHolderVoteStatus,
  loadProposals
} from '../store/interactions'

const Info = () => {
  const dispatch = useDispatch()

  const [isDAOMember, setIsDAOMember] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState(0)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isWaiting, setIsWaiting] = useState(false)

  const provider = useSelector((state) => state.provider.connection)
  const account = useSelector((state) => state.provider.account)
  const symbols = useSelector((state) => state.tokens.symbols)
  const balances = useSelector((state) => state.tokens.balances)
  const dao = useSelector((state) => state.dao.contract)
  const usdcBalance = useSelector((state) => state.dao.usdcBalance)
  const maxPropAmtPercent = useSelector((state) => state.dao.maxProposalAmountPercent)
  const nftBalances = useSelector((state) => state.nfts.nftBalances)

  const isMember = () => {
    setIsDAOMember(false)

    if(balances[0] > 0) {
      setIsDAOMember(true)
      return
    }

    for(let i = 0; i < nftBalances.length; i++) {
      if(nftBalances[i] > 0) {
        setIsDAOMember(true)
        return
      }
    }
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    setIsWaiting(true)

    await createProposal(provider, dao, recipient, amount, name, description, dispatch)

    const proposals = await loadProposals(dao, dispatch)
    const holderProposals = await loadHolderProposals(proposals, dispatch)
    await loadHolderVoteStatus(dao, holderProposals, account, dispatch)

    setRecipient('')
    setAmount(0)
    setName('')
    setDescription('')
    setIsWaiting(false)
  }

  useEffect(() => {
    if(account) {
      isMember()
    }
  }, [account, balances, nftBalances])

  return(
    <Card className='mt-4 mx-auto' style={{maxWidth: '500px', minHeight: '300px'}}>
      <Card.Header as='h3' >New Proposals</Card.Header>
      {account ? (
        isDAOMember ? (
          <Card.Body>
            <Form onSubmit={submitHandler}>
              <Form.Group className='mb-3'>
                <Form.Label>Recipient</Form.Label>
                <Form.Control type='text' required onChange={(e) => setRecipient(e.target.value)} value={recipient} placeholder='Enter wallet address'></Form.Control>
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>Amount</Form.Label>
                <Form.Text> (Max amount per proposal: {maxPropAmtPercent * usdcBalance / 100} {symbols[1]})</Form.Text>
                <InputGroup>
                  <Form.Control type='number' step='any' required onChange={(e) => setAmount(e.target.value)} value={amount}></Form.Control>
                  <InputGroup.Text>{symbols[1]}</InputGroup.Text>
                </InputGroup>
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>Name</Form.Label>
                <Form.Control type='text' required onChange={(e) => setName(e.target.value)} value={name} placeholder='Enter proposal name'></Form.Control>
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>Description</Form.Label>
                <Form.Control type='textbox' required onChange={(e) => setDescription(e.target.value)} value={description} placeholder='Enter proposal description'></Form.Control>
              </Form.Group>
              {isWaiting ? (
                <Spinner animation='border' className='d-block mx-auto' />
              ) : (
                <Button className='mb-3' style={{width: '100%'}} type='submit'>Submit</Button>
              )}
            </Form>
          </Card.Body>
        ) : (
          <Card.Body style={{color: 'red'}}>Purchase a NFT or donate to DAO to submit new proposals</Card.Body>
        )
      ) : (
        <p>Please connect your wallet</p>
      )}
    </Card>
  )
}

export default Info
