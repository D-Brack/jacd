import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ethers } from 'ethers'

import Card from 'react-bootstrap/Card'
import Table from 'react-bootstrap/Table'
import Countdown from 'react-countdown'
import Button from 'react-bootstrap/Button'

import {
  loadProposals,
  loadHolderProposals,
  submitHoldersVote,
  finalizeHoldersVote,
  loadOpenProposals,
  loadClosedProposals,
  loadHolderVoteStatus,
  loadHolderOpenVoteStatus
} from '../store/interactions'

const HolderVote = () => {
  const dispatch = useDispatch()

  const [isNFTHolder, setIsNFTHolder] = useState(false)
  const [votingClosed, setVotingClosed] = useState(false)

  const provider = useSelector((state) => state.provider.connection)
  const account = useSelector((state) => state.provider.account)
  const symbols = useSelector((state) => state.tokens.symbols)
  const nftBalances = useSelector((state) => state.nfts.nftBalances)
  const dao = useSelector((state) => state.dao.contract)
  const holderVotes = useSelector((state) => state.dao.holderVotes)
  const minHolderVotesToPass = useSelector((state) => state.dao.minHolderVotesToPass)
  const holderProposals = useSelector((state) => state.dao.holderProposals)
  const holderVoteStatus = useSelector((state) => state.dao.holderVoteStatus)

  const isHolder = async () => {
    setIsNFTHolder(false)

    for(let i = 0; i < nftBalances.length; i++) {
      if(nftBalances[i] > 0) {
        setIsNFTHolder(true)
        return
      }
    }
  }

  const buildVotingClosed = () => {
    const votingClosed = []

    for(let i = 0; i < holderProposals.length; i++) {
      if(Date.now() < (holderProposals[i].voteEnd * 1000)) {
        votingClosed.push(false)
      } else {
        votingClosed.push(true)
      }
    }

    setVotingClosed(votingClosed)
  }

  const voteForHandler = async (e) => {
    voteHandler(e.target.value, true)
  }

  const voteAgainstHandler = async (e) => {
    voteHandler(e.target.value, false)
  }

  const voteHandler = async (index, voteFor) => {
    await submitHoldersVote(provider, dao, index, voteFor)

    const proposals = await loadProposals(dao, dispatch)
    const holderProposals = await loadHolderProposals(proposals, dispatch)
    await loadHolderVoteStatus(dao, holderProposals, account, dispatch)
  }

  const finalizeHandler = async (e) => {
    await finalizeHoldersVote(provider, dao, e.target.value)

    const proposals = await loadProposals(dao, dispatch)
    const holderProposals = await loadHolderProposals(proposals, dispatch)
    await loadHolderVoteStatus(dao, holderProposals, account, dispatch)
    const openProposals = await loadOpenProposals(proposals, dispatch)
    await loadHolderOpenVoteStatus(dao, openProposals, account, dispatch)
    await loadClosedProposals(proposals, dispatch)
  }

  useEffect(() => {
    if(account) {
      isHolder()
    }
  }, [account, nftBalances])

  return(
    <Card className='my-4'>
      <Card.Header as='h3' >Holding Voting Proposals</Card.Header>
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
              {holderProposals.length === 0 ? (
                <tbody>
                <tr>
                  <td colSpan='8' style={{textAlign: 'center'}}>No proposals currently in holder voting phase</td>
                </tr>
                </tbody>
              ) : (
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
                        {(+(proposal.votesFor.toString()) + +(proposal.votesAgainst.toString())) === +holderVotes || votingClosed ? (
                          <Button value={proposal.index} onClick={finalizeHandler}>Finalize</Button>
                        ) : (
                          <div>
                            {votingClosed[index] ? (
                              <p>You have voted</p>
                            ) : (
                              <>
                                <Button value={[proposal.index]} onClick={voteForHandler}>Vote For</Button>
                                <Button className='mx-3' value={[proposal.index]} onClick={voteAgainstHandler} >Vote Against</Button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                      <td><Countdown date={(proposal.voteEnd * 1000) + 1000} onComplete={buildVotingClosed} /></td>
                    </tr>
                  ))}
                </tbody>
              )}
            </Table>
          </Card.Body>
        ) : (
          <Card.Body>Purchase an NFT to participate in holders voting</Card.Body>
        )
      ) : (
        <Card.Body>Please connect wallet</Card.Body>
      )}
      <Card.Footer>
        <Card.Subtitle>Holder Voting Specifications</Card.Subtitle>
        <Card.Text>
          Votes per NFT held: 1
          <br />
          Total holder votes: {holderVotes}
          <br />
          Minimum holder votes submitted to pass proposal: {minHolderVotesToPass}
        </Card.Text>
      </Card.Footer>
    </Card>
  )
}

export default HolderVote
