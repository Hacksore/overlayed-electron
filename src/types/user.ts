// User object
export interface IUser {
  username: string;
  id: string;
  avatarHash: string;
  isTalking: boolean;
  deafened: boolean;
  muted: boolean;
  volume: number;
}

export interface IDiscordUser {
  nick: string;
  mute: boolean;
  volume: number;
  pan: Pan;
  voice_state: VoiceState;
  user: User;
  isTalking: boolean;
}

interface Pan {
  left: number;
  right: number;
}

interface VoiceState {
  mute: boolean;
  deaf: boolean;
  self_mute: boolean;
  self_deaf: boolean;
  suppress: boolean;
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
