import isDev from "electron-is-dev";

const CLIENT_ID = "905987126099836938";
const CALLBACK_URL = isDev ? "http://localhost:3000/auth" : "https://overlayed.dev/auth";

const paramsMap: any = {
  client_id: CLIENT_ID,
  redirect_uri: CALLBACK_URL,
  response_type: "code",
  scope: "rpc",
};

const params = Object.keys(paramsMap)
  .map((k: string) => encodeURIComponent(k) + "=" + encodeURIComponent(paramsMap[k]))
  .join("&");

export const LOGIN_URL = `https://discord.com/api/oauth2/authorize?${params}`;
