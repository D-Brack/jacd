import { configureStore } from '@reduxjs/toolkit'
import provider from './reducers/provider'
import tokens from './reducers/tokens'
import dao from './reducers/dao'

export default configureStore({
  reducer: {
    provider,
    tokens,
    dao
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
