import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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

// TODO: we could move this user stuff to a seperate reducer
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
    },
    setUserTalking: (state, action: PayloadAction<any>) => {
      state.users.forEach((u: any) => {
        if (u.user.id === action.payload.id) {
          u.isTalking = action.payload.value;
        }
      });
    },
    addUser: (state, action: PayloadAction<any>) => {
      // TODO: this can't be the right place in the array?
      state.users.push(action.payload);
    },
    removeUser: (state, action: PayloadAction<any>) => {
      // TODO: this can't be the right place in the array?
      state.users = state.users.filter((u: any) => u.user.id !== action.payload);
    },
    updateUser: (state, action: PayloadAction<any>) => {
      // TODO: Need to implement      
    },
  },
});

export default appSlice.reducer;
