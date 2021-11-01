import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { RootState, AppThunk } from "./store";

export interface AppState {
  users: any[];
  isReady: boolean;
  isPinned: boolean;
}

const initialState: AppState = {
  users: [],
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
    setUsers: (state, action: PayloadAction<any>) => {
      state.users = action.payload;
    },
    setReadyState: (state, action: PayloadAction<boolean>) => {
      state.isReady = action.payload;
    },
  },
});

export default appSlice.reducer;
