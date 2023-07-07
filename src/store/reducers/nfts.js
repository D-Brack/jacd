import { createSlice } from "@reduxjs/toolkit";

export const nfts = createSlice({
  name: 'nfts',
  initialState: {
    collections: [],
    names: [],
    nftBalances: [],
  },
  reducers: {
    setCollections: (state, action) => {
      state.collections = action.payload
    },
    setNames: (state, action) => {
      state.names = action.payload
    },
    setNFTBalances: (state, action) => {
      state.nftBalances = action.payload
    }
  }
})

export const { setCollections, setNames, setNFTBalances } = nfts.actions

export default nfts.reducer
