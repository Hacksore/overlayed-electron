# overlayed

This is an electron based overlay application for Discord that leverages the local RPC websocket the client has running on `ws://127.0.0.1:6463`.

With this app you can view who talking in your current channel.

### Demo
<img src="https://user-images.githubusercontent.com/996134/139773800-4a607e0c-e2db-410a-b2ad-b338bb70ab6d.png" width="205" height="270">

### Running locally

For now you have load up your `.env` file with the required values shown in `.env.sample`. This process is rather silly and should be replaced with a first time user experience so that login is rather simple. 

Make sure you `npm install` all the dependencies then just run `npm run dev`.
