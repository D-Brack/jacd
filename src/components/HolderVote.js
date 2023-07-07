import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ethers } from 'ethers'

import Card from 'react-bootstrap/Card'
import Table from 'react-bootstrap/Table'
import Countdown from 'react-countdown'
import Button from 'react-bootstrap/Button'

import { loadHolderProposals } from '../store/interactions'

const HolderVote = () => {
  const dispatch = useDispatch()

  const [isNFTHolder, setIsNFTHolder] = useState(false)

  const account = useSelector((state) => state.provider.account)
  const symbols = useSelector((state) => state.tokens.symbols)
  const nftBalances = useSelector((state) => state.nfts.nftBalances)
  const holderProposals = useSelector((state) => state.dao.holderProposals)

  const isHolder = () => {
    for(let i = 0; i < nftBalances.length; i++) {
      if(nftBalances[i] > 0) {
        setIsNFTHolder(true)
        return
      }
    }

    setIsNFTHolder(false)
  }

  const voteForHandler = async (e) => {
    console.log('voting for...')
  }

  const voteAgainstHandler = async (e) => {
    console.log('voting against...')
  }

  useEffect(() => {
    if(account) {
      isHolder()
    }
  }, [account, nftBalances])

  return(
      <Card className='my-4'>
        <Card.Header as='h3' >Holder Voting Proposals</Card.Header>
        {account ? (
          isNFTHolder ? (
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
                  {holderProposals.map((proposal, index) => (
                    <tr key={index}>
                      <td>{proposal.index.toString()}</td>
                      <td>{proposal.description}</td>
                      <td>{`${proposal.recipient.slice(0, 6)}...${proposal.recipient.slice(-4)}`}</td>
                      <td>{ethers.utils.formatUnits(proposal.amount.toString(), 'ether')} {symbols[1]}</td>
                      <td>{proposal.votesFor.toString()}</td>
                      <td>{proposal.votesAgainst.toString()}</td>
                      <td>
                        <Button value={[proposal.index]} onClick={voteForHandler}>Vote For</Button>
                        <Button className='mx-3' value={[proposal.index]} onClick={voteAgainstHandler} >Vote Against</Button>
                      </td>
                      <td><Countdown date={proposal.voteEnd * 1000} /></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          ) : (
            <p>Purchase an NFT to participate in holders voting</p>
          )
        ) : (
          <p>Please connect wallet</p>
        )}
      </Card>
  )
}

export default HolderVote
