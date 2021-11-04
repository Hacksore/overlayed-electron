// User object
export interface IUser {
  username: string;
  id: string;
  avatarHash: string;
  talking: boolean;
  deafened: boolean;
  muted: boolean;
  suppress: boolean;
  selfDeafened: boolean;
  selfMuted: boolean;
  volume: number;
  bot: boolean;
  premium: number;
  flags: number;
  discriminator: string;
}

export interface IDiscordUser {
  nick: string;
  mute: boolean;
  volume: number;
  pan: Pan;
  voice_state: VoiceState;
  user: User;
}

interface Pan {
  left: number;
  right: number;
}

interface VoiceState {
  mute: boolean; // TBD
  deaf: boolean; // TBD
  self_mute: boolean;
  self_deaf: boolean;
  suppress: boolean; // maybe its a channel where you dont have perms to talk in aka suppress
}

interface User {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  bot: boolean;
  flags: number;
  premium_type: number;
}
