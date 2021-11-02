import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser, IDiscordUser } from "./types/user";
export interface AppState {
  users: Array<IUser>;
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

const createUserStateItem = (payload: IDiscordUser) => ({
  username: payload.nick,
  avatarHash: payload.user.avatar,
  muted: payload.voice_state.self_mute,
  deafened: payload.voice_state.self_deaf,
  isTalking: false,
  id: payload.user.id,
  volume: 100,
});

// TODO: we could move this user stuff to a seperate reducer
export const appSlice = createSlice({
  name: "root",
  initialState,
  reducers: {
    setAppUsers: (state, action: PayloadAction<Array<IDiscordUser>>) => {
      const users = action.payload.map((item: IDiscordUser) => createUserStateItem(item));
      state.users = users;
    },
    setReadyState: (state, action: PayloadAction<boolean>) => {
      state.isReady = action.payload;
    },
    setPinned: (state, action: PayloadAction<boolean>) => {
      state.isPinned = action.payload;
    },
    setUserTalking: (state, action: PayloadAction<{ id: string; value: boolean }>) => {
      state.users.forEach((item: IUser) => {
        if (item.id === action.payload.id) {
          item.isTalking = action.payload.value;
        }
      });
    },
    addUser: (state, action: PayloadAction<IDiscordUser>) => {
      // TODO: this can't be the right place in the array?
      const item = action.payload;
      state.users.push(createUserStateItem(item));
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((item: IUser) => item.id !== action.payload);
    },
    updateUser: (state, action: PayloadAction<IDiscordUser>) => {
      state.users = state.users.map((item: IUser) =>
        item.id === action.payload.user.id
          ? createUserStateItem(action.payload)
          : item
      );
    },
  },
});

export default appSlice.reducer;
