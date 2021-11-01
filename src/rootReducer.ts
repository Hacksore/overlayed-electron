import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { RootState, AppThunk } from "./store";

export interface AppState {
  users: any[];
  channelId: string | null;
  clientId: string | null;
  accessToken: string | null;
  isReady: boolean;
  isPinned: boolean;  
}

const initialState: AppState = {
  users: [],
  channelId: null,
  clientId: null,
  accessToken: null,
  isReady: false,
  isPinned: false,
};

// TODO: example of async thunk
export const incrementAsync = createAsyncThunk("counter/fetchCount", async (amount: number) => {
  // The value we return becomes the `fulfilled` action payload
  return [];
});

export const appSlice = createSlice({
  name: "root",
  initialState,
  reducers: {
    setAppUsers: (state, action: PayloadAction<any>) => {
      state.users = action.payload;
    },
    setReadyState: (state, action: PayloadAction<boolean>) => {
      state.isReady = action.payload;
    },
    setPinned: (state, action: PayloadAction<boolean>) => {
      state.isPinned = action.payload;
    } 
  },
});

export default appSlice.reducer;
