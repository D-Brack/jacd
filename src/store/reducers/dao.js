import { createSlice } from "@reduxjs/toolkit";

export const dao = createSlice({
  name: 'dao',
  initialState: {
    contract: null,
    usdcBalance: 0,
    jacdSupply: 0,
    proposals: []
  },
  reducers: {
    setContract: (state, action) => {
      state.contract = action.payload
    },
    setUSDCBalance: (state, action) => {
      state.usdcBalance = action.payload
    },
    setJACDSupply: (state, action) => {
      state.jacdSupply = action.payload
    },
    setProposals: (state, action) => {
      state.proposals = action.payload
    }
  }
})

export const {
  setContract,
  setUSDCBalance,
  setJACDSupply,
  setProposals
} = dao.actions

export default dao.reducer
