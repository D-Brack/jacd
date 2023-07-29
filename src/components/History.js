/* #region Dependencies */
import { useSelector } from 'react-redux'

import Card from 'react-bootstrap/Card'
import Table from 'react-bootstrap/Table'
/* #endregion */

const History = () => {

  /* #region Component Variables */

  const symbols = useSelector((state) => state.tokens.symbols)
  const closedProposals = useSelector((state) => state.dao.closedProposals)
  /* #endregion */

  /* #region Component Functions */

  const formatUSDC = (n) => {
    return n / 10**6
  }

  const returnStage = (stage) => {
    if(stage === '2') {return 'Finalized'}

    return 'Failed'
  }
  /* #endregion */

  return(
      <Card className='my-4'>
        <Card.Header as='h3' >Holder Voting Proposals</Card.Header>
        <Card.Body>
          <Table striped bordered hover >
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Recipient</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
              {closedProposals.length === 0 ? (
                <tbody>
                <tr>
                  <td colSpan='5' style={{textAlign: 'center'}}>No proposal history</td>
                </tr>
                </tbody>
              ) : (
                <tbody>
                  {closedProposals.map((proposal, index) => (
                    <tr key={index}>
                      <td>{proposal.index.toString()}</td>
                      <td>{proposal.name}</td>
                      <td>{`${proposal.recipient.slice(0, 6)}...${proposal.recipient.slice(-4)}`}</td>
                      <td>{formatUSDC(proposal.amount.toString())} {symbols[1]}</td>
                      <td>{returnStage(proposal.stage.toString())}</td>
                    </tr>
                  ))}
                </tbody>
              )}
          </Table>
        </Card.Body>
      </Card>
  )
}

export default History
