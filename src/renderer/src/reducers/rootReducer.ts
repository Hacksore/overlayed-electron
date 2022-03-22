import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IDiscordChannel } from "../types/channel";
import { IUser, IDiscordUser } from "../types/user";

export type IUserProfile = Pick<IUser, "id" | "username" | "avatarHash" | "discriminator">;
export interface AppState {
  users: Array<IUser>;
  currentChannel: IDiscordChannel | null;
  profile: IUserProfile | null;
  accessToken: string | null;
  isReady: boolean;
  isPinned: boolean;
  isAuthed: boolean;
  clickThrough: boolean;
  contextMenu: any;
  newVersion: boolean;
}

const initialState: AppState = {
  users: [],
  currentChannel: null,
  profile: null,
  accessToken: null,
  isReady: false,
  isPinned: false,
  isAuthed: false,
  clickThrough: false,
  contextMenu: {
    open: false,
    id: null,
    x: null,
    y: null,
  },
  newVersion: false,
};

const createUserStateItem = (payload: IDiscordUser) => ({
  username: payload.nick,
  avatarHash: payload.user.avatar,
  muted: payload.mute,
  deafened: payload.voice_state.deaf, // Probably only bots can deafen themselves
  selfDeafened: payload.voice_state.self_deaf,
  selfMuted: payload.voice_state.self_mute,
  suppress: payload.voice_state.suppress,
  talking: false,
  id: payload.user.id,
  volume: payload.volume,
  bot: payload.user.bot,
  flags: payload.user.flags,
  premium: payload.user.premium_type,
  discriminator: payload.user.discriminator,
  lastUpdate: 0,
});

// TODO: we could move this user stuff to a seperate reducer
// This thing is a bit out of controll now and does need some splitting up
export const appSlice = createSlice({
  name: "root",
  initialState,
  reducers: {
    setClickThrough: (state, action: PayloadAction<boolean>) => {
      state.clickThrough = action.payload;
    },
    setIsAuthed: (state, action: PayloadAction<boolean>) => {
      state.isAuthed = action.payload;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    setCurrentVoiceChannel: (state, action: PayloadAction<any>) => {
      state.currentChannel = action.payload;
    },
    setProfile: (state, action: PayloadAction<IUserProfile | null>) => {
      state.profile = action.payload;
    },
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
          item.talking = action.payload.value;
        }
      });
    },
    addUser: (state, action: PayloadAction<IDiscordUser>) => {
      // TODO: this can't be the right place in the array?
      const item = action.payload;
      // dont any anyone already in the state?
      if (state.users.find(user => user.id === item.user.id)) {
        return;
      }

      state.users.push(createUserStateItem(item));
    },
    removeUser: (state, action: PayloadAction<string>) => {
      // check for myself leaving a channel so that I can unsubscribe from the old channel
      if (action.payload === state.profile?.id) {
        // unset channel
        state.users = [];
        state.currentChannel = null;
        return;
      }

      state.users = state.users.filter((item: IUser) => item.id !== action.payload);
    },
    updateUser: (state, action: PayloadAction<IDiscordUser>) => {
      // don't get updates yet until the client is ready
      if (!state.isReady) {
        return;
      }

      state.users = state.users
        // TODO: sort like discord if we can
        .sort((userA: IUser, userB: IUser) => {
          const nameA = userA.username.toLowerCase();
          const nameB = userB.username.toLowerCase();

          if (nameA === nameB) {
            return 0;
          } else if (nameA > nameB) {
            return 1;
          } else {
            return -1;
          }
        })
        .map((item: IUser) => (item.id === action.payload.user.id ? createUserStateItem(action.payload) : item));
    },
    setContextMenu: (state, action: PayloadAction<any>) => {
      state.contextMenu = action.payload;
    },
    setNewVersion: (state, action: PayloadAction<boolean>) => {
      state.newVersion = action.payload;
    },
  },
});

export default appSlice.reducer;
