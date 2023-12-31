/* #region Dependencies */
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ethers } from 'ethers'

import Card from 'react-bootstrap/Card'
import Table from 'react-bootstrap/Table'
import Countdown from 'react-countdown'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'

import {
  loadUserBalances,
  loadDAOBalances,
  loadHolderOpenVoteStatus,
  loadOpenProposals,
  loadProposals,
  loadClosedProposals,
  submitOpenVote,
  finalizeProposal
} from '../store/interactions'
/* #endregion */

const OpenVote = () => {

/* #region Component Variables */
  const dispatch = useDispatch()

  const [isDAOMember, setIsDAOMember] = useState(false)
  const [isHolder, setIsHolder] = useState(false)
  const [userHolderVotes, setUserHolderVotes] = useState(0)
  const [isContributor, setIsContributor] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [jacdVotes, setJACDVotes] = useState(0)
  const [votedStatusIndex, setVoteStatusIndex] = useState(null)
  const [votingClosed, setVotingClosed] = useState(null)
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [isVoting, setIsVoting] = useState(false)
  const [showVoteAlert, setShowVoteAlert] = useState(false)
  const [voteSuccess, setVoteSuccess] = useState(false)
  const [showFinalizeAlert, setShowFinalizeAlert] = useState(false)
  const [finalizeSuccess, setFinalizeSuccess] = useState(false)
  const [showNoVoteAlert, setShowNoVoteAlert] = useState(false)


  const provider = useSelector((state) => state.provider.connection)
  const account = useSelector((state) => state.provider.account)
  const tokens = useSelector((state) => state.tokens.contracts)
  const symbols = useSelector((state) => state.tokens.symbols)
  const balances = useSelector((state) => state.tokens.balances)
  const nftBalances = useSelector((state) => state.nfts.nftBalances)
  const dao = useSelector((state) => state.dao.contract)
  const holdersWeight = useSelector((state) => state.dao.holdersWeight)
  const totalHolderVotes = useSelector((state) => state.dao.holderVotes)
  const votesToFinalize = useSelector((state) => state.dao.minVotesToFinalize)
  const openProposals = useSelector((state) => state.dao.openProposals)
  const holderOpenVoteStatus = useSelector((state) => state.dao.holderOpenVoteStatus)
/* #endregion */

/* #region Component Functions */
  const formatUSDC = (n) => {
    return n / 10**6
  }

  const isMember = () => {
    setIsDAOMember(false)
    setIsHolder(false)
    setUserHolderVotes(0)
    setIsContributor(false)

    let votes = 0

    if(balances[0] > 0) {
      setIsDAOMember(true)
      setIsContributor(true)
    }

    for(let i = 0; i < nftBalances.length; i++) {
      if(nftBalances[i] > 0) {
        setIsDAOMember(true)
        setIsHolder(true)
        votes += (nftBalances[i] * +holdersWeight)
      }
    }

    setUserHolderVotes(votes)
  }

  const buildVotingClosed = () => {
    const votingClosed = []

    for(let i = 0; i < openProposals.length; i++) {
      if(Date.now() < (openProposals[i].voteEnd * 1000)) {
        votingClosed.push(false)
      } else {
        votingClosed.push(true)
      }
    }

    setVotingClosed(votingClosed)
  }

  const showVoteModal = (e) => {
    setShowVoteAlert(false)
    setShowFinalizeAlert(false)
    setShowNoVoteAlert(false)
    setShowModal(true)
    const proposal = e.target.value.split(',')
    setVoteStatusIndex(proposal[9])
    setSelectedProposal(proposal)
  }

  const dismissModal = () => {
    setShowModal(false)
    setJACDVotes(0)
  }

  const voteHandler = async (e) => {
    setIsVoting(true)

    let voteFor

    if(e.target.value === 'true') {
      voteFor = true
    } else {
      voteFor = false
    }

    if(holderOpenVoteStatus[votedStatusIndex] && jacdVotes === 0) {
      setShowNoVoteAlert(true)
      dismissModal()
      setIsVoting(false)
      return
    }

    const success = await submitOpenVote(provider, dao, tokens, selectedProposal[0], voteFor, jacdVotes, dispatch)
    setVoteSuccess(success)

    await loadUserBalances(tokens, account, dispatch)
    await loadDAOBalances(tokens, dao, dispatch)
    const proposals = await loadProposals(dao, dispatch)
    const openProposals = await loadOpenProposals(proposals, dispatch)
    await loadHolderOpenVoteStatus(dao, openProposals, account, dispatch)

    dismissModal()
    setIsVoting(false)
    setShowVoteAlert(true)
  }

  const finalizeHandler = async (e) => {
    setShowVoteAlert(false)
    setShowFinalizeAlert(false)

    const success = await finalizeProposal(provider, dao, e.target.value)
    setFinalizeSuccess(success)

    const proposals = await loadProposals(dao, dispatch)
    const openProposals = await loadOpenProposals(proposals, dispatch)
    await loadHolderOpenVoteStatus(dao, openProposals, account, dispatch)
    await loadClosedProposals(proposals, dispatch)
    await loadUserBalances(tokens, account, dispatch)
    await loadDAOBalances(tokens, dao, dispatch)

    setShowFinalizeAlert(true)
  }
/* #endregion */

/* #region Hooks */
  useEffect(() => {
    if(account) {
      isMember()
    }
  }, [account, balances, nftBalances])

  useEffect(() => {
    buildVotingClosed()
  }, [openProposals])
/* #endregion */

  return(
    <>
      {showVoteAlert && (
        voteSuccess ? (
          <Alert className='mx-auto my-4' style={{ maxWidth: '400px' }} dismissible variant='success'>
            <Alert.Heading>Vote Submission</Alert.Heading>
            <hr />
            <p>Vote successful!</p>
          </Alert>
        ) : (
          <Alert className='mx-auto my-4' style={{ maxWidth: '400px' }} dismissible variant='danger'>
            <Alert.Heading>Vote Submission</Alert.Heading>
            <hr />
            <p>Vote failed!</p>
          </Alert>
        )
      )}

      {showFinalizeAlert && (
        finalizeSuccess ? (
          <Alert className='mx-auto my-4' style={{ maxWidth: '400px' }} dismissible variant='success'>
            <Alert.Heading>Finalize Open Stage</Alert.Heading>
            <hr />
            <p>Finalization successful!</p>
          </Alert>
        ) : (
          <Alert className='mx-auto my-4' style={{ maxWidth: '400px' }} dismissible variant='danger'>
            <Alert.Heading>Finalize Open Stage</Alert.Heading>
            <hr />
            <p>Finalization failed!</p>
          </Alert>
        )
      )}

      {showNoVoteAlert && (
          <Alert className='mx-auto my-4' style={{ maxWidth: '400px' }} dismissible variant='secondary'>
            <Alert.Heading>Vote Not Submitted</Alert.Heading>
            <hr />
            <p>No holder or JACD votes were submitted.</p>
          </Alert>
      )}

      <Card className='my-4'>
        <Card.Header as='h3' >Open Voting Proposals</Card.Header>
        {account ? (
          <Card.Body>
            <Table striped bordered hover >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Recipient</th>
                  <th>Amount</th>
                  <th>Votes For</th>
                  <th>Votes Against</th>
                  <th>Actions</th>
                  <th>Time Remaining</th>
                </tr>
              </thead>
              {openProposals.length === 0 ? (
                <tbody>
                <tr>
                  <td colSpan='8' style={{textAlign: 'center'}}>No proposals currently in open voting phase</td>
                </tr>
                </tbody>
              ) : (
                <tbody>
                  {openProposals.map((proposal, index) => (
                    <tr key={index}>
                      <td>{proposal.index.toString()}</td>
                      <td>{proposal.name}</td>
                      <td>{`${proposal.recipient.slice(0, 6)}...${proposal.recipient.slice(-4)}`}</td>
                      <td>{formatUSDC(proposal.amount.toString())} {symbols[1]}</td>
                      <td>{ethers.utils.formatUnits(proposal.votesFor.toString(), 'ether')}</td>
                      <td>{ethers.utils.formatUnits(proposal.votesAgainst.toString())}</td>
                      <td>
                        {isDAOMember && (
                          votingClosed[index] ? (
                            <Button value={proposal.index} onClick={finalizeHandler}>Finalize</Button>
                          ) : (
                            (isHolder && holderOpenVoteStatus[index]) && +balances[0] === 0 ? (
                              <p>No votes remaining</p>
                            ) : (
                              <div>
                                <Button value={[proposal, index]} onClick={showVoteModal}>View/Vote</Button>
                                {holderOpenVoteStatus[index] ? <span className='mx-2'>(holder votes submitted)</span> : ''}
                              </div>
                        )))}
                      </td>
                      <td><Countdown date={(proposal.voteEnd * 1000) + 1000} onComplete={buildVotingClosed} /></td>
                    </tr>
                  ))}
                </tbody>
              )}
            </Table>
            {!isDAOMember && <p style={{color: 'red'}}>Purchase a NFT or donate to DAO to participate in open voting.</p>}
          </Card.Body>
        ) : (
          <Card.Body>Please connect your wallet</Card.Body>
        )}
        <Card.Footer>
          <Card.Subtitle>Holder Voting Specifications</Card.Subtitle>
          <Card.Text>
            Votes per NFT held: {holdersWeight}
            <br />
            Total holder votes: {totalHolderVotes * holdersWeight}
            <br />
            Minimum votes submitted to pass proposal: {ethers.utils.formatUnits(votesToFinalize.toString(), 'ether')}
          </Card.Text>
        </Card.Footer>
      </Card>

      {selectedProposal && (
        <Modal show={showModal} onHide={dismissModal} centered backdrop='static'>
          <Modal.Header closeButton>
            <Modal.Title>{selectedProposal[3]}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>Recepient: </strong>{selectedProposal[1].slice(0, 6)}...{selectedProposal[1].slice(-4)}</p>
            <p><strong>Amount: </strong>{formatUSDC(selectedProposal[2])} {symbols[1]}</p>
            <p><strong>Description: </strong>{selectedProposal[4]}</p>
            {isHolder ? (
                holderOpenVoteStatus[votedStatusIndex] ? (
                  <p style={{color: 'red'}}>Holder votes already submitted.</p>
                ) : (
                  <p><strong>Holder Votes To Submit: </strong>{userHolderVotes}</p>
                  // <p>{`Submitting ${userHolderVotes} NFT holder's votes.`}</p>
                )
            ) : (
              <></>
            )}
            {isContributor ? (
            <Form>
              <Form.Group>
                <Form.Label><strong>JACD votes to submit</strong> {`(${balances[0]} JACD available)`}</Form.Label>
                <Form.Control
                  type='number'
                  step='any'
                  value={jacdVotes}
                  onChange={(e) => setJACDVotes(e.target.value)}
                  max={balances[0]}
                  min={1}
                  required
                />
              </Form.Group>
            </Form>
            ) : (
              <></>
            )}
          </Modal.Body>
          <Modal.Footer>
            {isVoting ? (
              <Spinner animation='border' className='d-block mx-auto' />
            ) : (
              <div  className='d-block mx-auto'>
                <Button onClick={voteHandler} value={true}>Vote For</Button>
                <Button className='mx-2' onClick={voteHandler} value={false}>Vote Against</Button>
                <Button onClick={dismissModal}>Cancel</Button>
              </div>
            )}
          </Modal.Footer>
        </Modal>
      )}
    </>
  )
}

export default OpenVote
