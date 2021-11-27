// https://discord.com/api/oauth2/authorize?client_id=905987126099836938&redirect_uri=https%3A%2F%2Fauth.overlayed.dev%2Foauth%2Fcallback&response_type=code&scope=rpc";
const CLIENT_ID = "905987126099836938";
const CALLBACK_URL = "https://auth.overlayed.dev/oauth/callback";

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
