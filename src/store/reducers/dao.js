import { createSlice } from "@reduxjs/toolkit";

export const dao = createSlice({
  name: 'dao',
  initialState: {
    contract: null,
    usdcBalance: 0,
    jacdSupply: 0,
    holderVotes: 0,
    proposals: [],
    holderProposals: [],
    holderVoteStatus: [],
    openProposals: [],
    closedProposals: [],
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
    setHolderVotes: (state, action) => {
      state.holderVotes = action.payload
    },
    setProposals: (state, action) => {
      state.proposals = action.payload
    },
    setHolderProposals: (state, action) => {
      state.holderProposals = action.payload
    },
    setHolderVoteStatus: (state, action) => {
      state.holderVoteStatus = action.payload
    },
    setOpenProposals: (state, action) => {
      state.openProposals = action.payload
    },
    setClosedProposals: (state, action) => {
      state.closedProposals = action.payload
    }
  }
})

export const {
  setContract,
  setUSDCBalance,
  setJACDSupply,
  setHolderVotes,
  setProposals,
  setHolderProposals,
  setHolderVoteStatus,
  setOpenProposals,
  setClosedProposals
} = dao.actions

export default dao.reducer
