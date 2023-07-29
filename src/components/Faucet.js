/* #region Dependencies */

import { useDispatch, useSelector } from 'react-redux'
import { useState, useEffect } from 'react'

import Button from 'react-bootstrap/Button'

import {
  loadUserBalances,
  loadNFTBalances,
  faucetRequest
} from '../store/interactions'
/* #endregion */

const Faucet = () => {

  /* #region Component Variables */

  const dispatch = useDispatch()

  const [hasUSDC, setHasUSDC] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  const provider = useSelector((state) => state.provider.connection)
  const chainId = useSelector((state) => state.provider.chainId)
  const account = useSelector((state) => state.provider.account)
  const tokens = useSelector((state) => state.tokens.contracts)
  const symbols = useSelector((state) => state.tokens.symbols)
  const balances = useSelector((state) => state.tokens.balances)
  const dao = useSelector((state) => state.dao.contract)
  const nfts = useSelector((state) => state.nfts.collections)
  /* #endregion */

  /* #region Component Functions */

  const claimHandler = async () => {
    setIsClaiming(true)

    await faucetRequest(provider, chainId, dao, hasUSDC)

    await loadUserBalances(tokens, account, dispatch)
    await loadNFTBalances(nfts, account, dispatch)

    setIsClaiming(false)
  }

  const checkForAssets = () => {
    if(balances[1] > 0) {
      setHasUSDC(true)
    } else {
      setHasUSDC(false)
    }
  }
  /* #endregion */

  /* #region Hooks */

  useEffect(() => {
    if(account) {
      checkForAssets()
    }
  }, [account, balances])
  /* #endregion */

  return(
    <>
      {account && (
        <>
          <hr />

          <div className='mb-3'>
            <p className='d-inline-block mx-3' ><strong>{`Claim ${symbols[1]} & NFT assets for app testing`}</strong></p>

            {isClaiming ? (
              <Button disabled>Claiming...</Button>
            ) : (
              hasUSDC ? (
                <Button disabled>Assets Claimed</Button>
              ) : (
                <Button onClick={claimHandler}>Claim Assets</Button>
              )
            )}
          </div>

          <strong className='mx-3' >Sepolia Testnet Ether Faucets</strong>
          <ul className='ms-3'>
            <li><a target="_blank" rel='noreferrer' href='https://sepoliafaucet.com'>Alchemy</a></li>
            <li><a target="_blank" rel='noreferrer' href='https://faucet.quicknode.com/ethereum/sepolia'>QuickNode</a></li>
            <li><a target="_blank" rel='noreferrer' href='https://www.infura.io/faucet/sepolia'>Infura</a></li>
          </ul>
        </>
      )}
    </>
  )
}

export default Faucet
