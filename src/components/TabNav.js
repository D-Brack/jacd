import Nav from 'react-bootstrap/Nav'
import { LinkContainer } from 'react-router-bootstrap'

const TabNav = () => {
  return(
    <Nav variant='underline' className='justify-content-center'>
      <LinkContainer to='/' >
         <Nav.Link className='mx-2' >Home</Nav.Link>
      </LinkContainer>
      <LinkContainer to='/create_proposal' >
         <Nav.Link className='mx-2' >Create Proposal</Nav.Link>
      </LinkContainer>
      <LinkContainer to='/holder_voting' >
         <Nav.Link className='mx-2' >Holder Voting</Nav.Link>
      </LinkContainer>
      <LinkContainer to='/open_voting' >
         <Nav.Link className='mx-2' >Open Voting</Nav.Link>
      </LinkContainer>
      <LinkContainer to='/history' >
         <Nav.Link className='mx-2' >History</Nav.Link>
      </LinkContainer>
    </Nav>
  )
}

export default TabNav
