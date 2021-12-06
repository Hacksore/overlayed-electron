import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// TODO: this is already setup just repurpose as history in redux was bad idea
// and we solved that be a ref to the socket class
export interface HistoryState {
  currentRoute: string | null;
}

const initialState: HistoryState = {
  currentRoute: null,
};

// TODO: we could move this user stuff to a seperate reducer
// This thing is a bit out of controll now and does need some splitting up
export const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    setCurrentRoute: (state, action: PayloadAction<string | null>) => {
      // set current route
      state.currentRoute = action.payload;
    },
  },
});

export default historySlice.reducer;
