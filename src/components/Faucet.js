import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'

import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

import {
  loadUserBalances,
  loadNFTBalances,
  faucetRequest
} from '../store/interactions'

const Faucet = () => {
  const dispatch = useDispatch()

  const [isClaiming, setIsClaiming] = useState(false)

  const provider = useSelector((state) => state.provider.connection)
  const chainId = useSelector((state) => state.provider.chainId)
  const account = useSelector((state) => state.provider.account)
  const tokens = useSelector((state) => state.tokens.contracts)
  const dao = useSelector((state) => state.dao.contract)
  const nfts = useSelector((state) => state.nfts.collections)

  const claimHandler = async () => {
    setIsClaiming(true)

    await faucetRequest(provider, chainId, dao)

    await loadUserBalances(tokens, account, dispatch)
    await loadNFTBalances(nfts, account, dispatch)

    setIsClaiming(false)
  }

  return(
    <div className='mb-3'>
      <p className='d-inline-block mx-3' ><strong>Claim assets for app testing</strong></p>

      {isClaiming ? (
        <Button disabled>Claiming...</Button>
      ) : (
        <Button onClick={claimHandler}>Claim Assets</Button>
      )}
    </div>
  )
}

export default Faucet
