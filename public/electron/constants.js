const isDev = require("electron-is-dev");

const CLIENT_ID = "905987126099836938";
const CALLBACK_URL = isDev ? "http://localhost:8000/auth" : "https://overlayed.dev/auth";

const paramsMap = {
  client_id: CLIENT_ID,
  redirect_uri: CALLBACK_URL,
  response_type: "code",
  scope: "rpc",
};

const params = Object.keys(paramsMap)
  .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(paramsMap[k]))
  .join("&");

module.exports = {
  LOGIN_URL: `https://discord.com/api/oauth2/authorize?${params}`,
};
