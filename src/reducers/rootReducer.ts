import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser, IDiscordUser } from "../types/user";
export interface AppState {
  users: Array<IUser>;
  channels: Array<any>; // TODO: type
  currentChannel: any; // TODO: type
  guilds: Array<any> | null; // TODO: type
  clientId: string | null;
  accessToken: string | null;
  isReady: boolean;
  isPinned: boolean;
  isAuthed: boolean;
  channelName: string | null;
}

const initialState: AppState = {
  users: [],
  channels: [],
  currentChannel: null,
  guilds: null,
  clientId: null,
  accessToken: null,
  isReady: false,
  isPinned: true,
  isAuthed: false,
  channelName: null,
};

const createUserStateItem = (payload: IDiscordUser) => ({
  username: payload.nick,
  avatarHash: payload.user.avatar,
  muted: payload.mute,
  deafened: payload.voice_state.deaf, // Probably only bots can deafen themselves
  selfDeafened: payload.voice_state.self_deaf,
  selfMuted: payload.voice_state.self_mute,
  suppress: payload.voice_state.suppress,
  // TODO: add states for showing my mute states for others
  talking: false,
  id: payload.user.id,
  volume: 100,
  bot: payload.user.bot,
  flags: payload.user.flags,
  premium: payload.user.premium_type,
  discriminator: payload.user.discriminator,
  lastUpdate: 0,
});

// TODO: we could move this user stuff to a seperate reducer
export const appSlice = createSlice({
  name: "root",
  initialState,
  reducers: {
    setIsAuthed: (state, action: PayloadAction<boolean>) => {
      state.isAuthed = action.payload;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    // TODO: type
    setGuilds: (state, action: PayloadAction<Array<any>>) => {
      state.guilds = action.payload;
    },
    setCurrentVoiceChannel: (state, action: PayloadAction<any>) => {
      state.currentChannel = action.payload;
    },
    setClientId: (state, action: PayloadAction<string>) => {
      state.clientId = action.payload;
    },
    setAppUsers: (state, action: PayloadAction<Array<IDiscordUser>>) => {
      // don't get updates yet until the client is read
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
          item.talking = action.payload.value;
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
      // don't get updates yet until the client is read
      if (!state.isReady) {
        return;
      }
      
      state.users = state.users
        // TODO: sort like discord if we can
        .sort((userA: IUser, userB: IUser) => {
          if (userA.username.toLowerCase() === userB.username.toLowerCase()) {
            return 0;
          } else if (userA.username.toLowerCase() > userB.username.toLowerCase()) {
            return 1;
          } else {
            return -1;
          }
        })
        .map((item: IUser) => (item.id === action.payload.user.id ? createUserStateItem(action.payload) : item));
    },
  },
});

export default appSlice.reducer;
