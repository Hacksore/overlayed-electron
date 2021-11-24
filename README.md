# overlayed

[![CI](https://img.shields.io/github/workflow/status/Hacksore/overlayed/CI)](https://github.com/Hacksore/overlayed/actions?query=workflow%3ACI)
[![Discord](https://img.shields.io/discord/906349283358408704)](https://discord.gg/pgsnx5kWen)

This is an electron based overlay application for Discord that leverages the local [RPC protcol](https://discord.com/developers/docs/topics/rpc) via an IPC socket.

Currently using a fork of [discord-rpc](https://github.com/discordjs/RPC) to handle connecting ot the client.

With this app you can view who talking in your current channel.
### Why not just use the native overlay

1. This _should_ work in any game as long as you can set windowed borderless mode
1. You can use this in any application such as VSCode 

### Demo
![UIYqSWS8Ja](https://user-images.githubusercontent.com/996134/140843479-0f349668-5e1d-48aa-b546-1ca90212ec2e.gif)

### Running locally

Make sure you `npm install` all the dependencies then just run `npm start`.


### Debug

Better to run `npm run react` then f5 in VSCode to run electron in debug mode.