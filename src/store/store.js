import { configureStore } from '@reduxjs/toolkit'
import provider from './reducers/provider'
import tokens from './reducers/tokens'
import dao from './reducers/dao'
import nfts from './reducers/nfts'

export default configureStore({
  reducer: {
    provider,
    tokens,
    dao,
    nfts
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
