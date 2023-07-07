import { useEffect, dispatch, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ethers } from 'ethers'

import Card from 'react-bootstrap/Card'
import Table from 'react-bootstrap/Table'
import Countdown from 'react-countdown'
import Button from 'react-bootstrap/Button'

const OpenVote = () => {
  const dispatch = useDispatch()

  const [isDAOMember, setIsDAOMember] = useState(false)
  const [isHolder, setIsHolder] = useState(false)
  const [isContributor, setIsContributor] = useState(false)

  const account = useSelector((state) => state.provider.account)
  const symbols = useSelector((state) => state.tokens.symbols)
  const balances = useSelector((state) => state.tokens.balances)
  const nftBalances = useSelector((state) => state.nfts.nftBalances)
  const openProposals = useSelector((state) => state.dao.openProposals)

  const isMember = () => {
    setIsDAOMember(false)
    setIsHolder(false)
    setIsContributor(false)

    if(balances[0] > 0) {
      setIsDAOMember(true)
      setIsContributor(true)
    }

    for(let i = 0; i < nftBalances.length; i++) {
      if(nftBalances[i] > 0) {
        setIsDAOMember(true)
        setIsHolder(true)
      }
    }
  }

  useEffect(() => {
    if(account) {
      isMember()
    }
  }, [account, balances, nftBalances])

  return(
      <Card className='my-4'>
        <Card.Header as='h3' >Holder Voting Proposals</Card.Header>
        {account ? (
          isDAOMember ? (
            <Card.Body>
              <Table striped bordered hover >
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Description</th>
                    <th>Recipient</th>
                    <th>Amount</th>
                    <th>Votes For</th>
                    <th>Votes Against</th>
                    <th>Actions</th>
                    <th>Time Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {openProposals.map((proposal, index) => (
                    <tr key={index}>
                      <td>{proposal.index.toString()}</td>
                      <td>{proposal.description}</td>
                      <td>{`${proposal.recipient.slice(0, 6)}...${proposal.recipient.slice(-4)}`}</td>
                      <td>{ethers.utils.formatUnits(proposal.amount.toString(), 'ether')} {symbols[1]}</td>
                      <td>{proposal.votesFor.toString()}</td>
                      <td>{proposal.votesAgainst.toString()}</td>
                      <td>
                        <Button>Vote For</Button>
                        <Button className='mx-3'>Vote Against</Button>
                      </td>
                      <td><Countdown date={proposal.voteEnd * 1000} /></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          ) : (
            <p>Purchase an NFT or donate to the DAO to participate in open voting</p>
          )
        ) : (
          <p>Please connect your wallet</p>
        )}
      </Card>
  )
}

export default OpenVote
