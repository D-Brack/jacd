import { useDispatch, useSelector } from 'react-redux'

import Button from 'react-bootstrap/Button'

import { loadUserBalances, loadNFTBalances, faucetRequest } from '../store/interactions'

const Faucet = () => {
  const dispatch = useDispatch()

  const provider = useSelector((state) => state.provider.connection)
  const chainId = useSelector((state) => state.provider.chainId)
  const account = useSelector((state) => state.provider.account)
  const tokens = useSelector((state) => state.tokens.contracts)
  const dao = useSelector((state) => state.dao.contract)
  const nfts = useSelector((state) => state.nfts.collections)

  const claimHandler = async () => {
    console.log('claiming assets...')

    await faucetRequest(provider, chainId, dao)

    await loadUserBalances(tokens, account, dispatch)
    await loadNFTBalances(nfts, account, dispatch)
  }

  return(
    <div className='mb-3'>
      <p className='d-inline-block mx-3'><strong>Claim assets for app testing</strong></p>
      <Button onClick={claimHandler}>Claim Assets</Button>
    </div>
  )
}

export default Faucet
