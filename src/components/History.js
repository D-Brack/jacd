import { useEffect, dispatch } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ethers } from 'ethers'

import Card from 'react-bootstrap/Card'
import Table from 'react-bootstrap/Table'

import { loadClosedProposals } from '../store/interactions'

const History = () => {
  const dispatch = useDispatch

  const account = useSelector((state) => state.provider.account)
  const symbols = useSelector((state) => state.tokens.symbols)
  const balances = useSelector((state) => state.tokens.balances)
  const proposals = useSelector((state) => state.dao.proposals)
  const closedProposals = useSelector((state) => state.dao.closedProposals)

  return(
      <Card className='my-4'>
        <Card.Header as='h3' >Holder Voting Proposals</Card.Header>
        <Card.Body>
          <Table striped bordered hover >
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Recipient</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {closedProposals.map((proposal, index) => (
                <tr key={index}>
                  <td>{proposal.index.toString()}</td>
                  <td>{proposal.description}</td>
                  <td>{`${proposal.recipient.slice(0, 6)}...${proposal.recipient.slice(-4)}`}</td>
                  <td>{ethers.utils.formatUnits(proposal.amount.toString(), 'ether')} {symbols[1]}</td>
                  <td>{proposal.stage.toString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
  )
}

export default History
