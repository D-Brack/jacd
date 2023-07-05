import { useSelector } from 'react-redux'

import CardGroup from 'react-bootstrap/CardGroup'
import Card from 'react-bootstrap/Card'

const Info = () => {
  const account = useSelector((state) => state.provider.account)
  const symbols = useSelector((state) => state.tokens.symbols)
  const balances = useSelector((state) => state.tokens.balances)
  const usdcBalance = useSelector((state) => state.dao.usdcBalance)
  const jacdSupply = useSelector((state) => state.dao.jacdSupply)

  return(
    <CardGroup className='mx-auto mt-4' style={{maxWidth: '1000px'}}>
      <Card style={{maxWidth: '500px'}}>
        <Card.Header as='h3' >DAO Info</Card.Header>
        <Card.Subtitle as='h4'>Token Info</Card.Subtitle>
        <Card.Text><strong>{symbols[1]} Balance: </strong>{usdcBalance}</Card.Text>
        <Card.Text><strong>{symbols[0]} Supply: </strong>{jacdSupply}</Card.Text>
      </Card>

      {account && (
        <Card className='' style={{maxWidth: '500px'}}>
          <Card.Header as='h3' >Your Info</Card.Header>
          <Card.Subtitle as='h4'>Token Balances</Card.Subtitle>
          <Card.Text><strong>{symbols[1]} Balance: </strong>{balances[1]}</Card.Text>
          <Card.Text><strong>{symbols[0]} Balance: </strong>{balances[0]}</Card.Text>
        </Card>
      )}
    </CardGroup>
  )
}

export default Info
