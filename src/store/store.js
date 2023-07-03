import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import provider from './reducers/provider'

export default configureStore({
  reducer: {
    provider
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
