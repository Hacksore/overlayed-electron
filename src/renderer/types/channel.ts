// Channel type
export interface IDiscordChannel {
  id: string;
  guild_id: string;
  bitrate: number;
  messages: Array<any>;
  name: string;
  position: number;
  topic: string;
  type: number;
  user_limit: number;
  voice_states: Array<any>;
}