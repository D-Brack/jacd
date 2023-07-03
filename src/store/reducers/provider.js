import { createSlice } from "@reduxjs/toolkit";

export const provider = createSlice({
  name: 'provider',
  initialState: {
    connection: null,
    chainId: null,
    account: null,
  },
  reducers: {
    setConnection: (state, action) => {
      state.connection = action.payload
    },
    setChainId: (state, action) => {
      state.chainId = action.payload
    },
    setAccount: (state, action) => {
      state.account = action.payload
    }
  }
})

export const { setConnection, setChainId, setAccount } = provider.actions

export default provider.reducer
