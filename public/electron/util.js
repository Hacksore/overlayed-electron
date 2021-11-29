const net = require("net");
const basePath = "\\\\?\\pipe\\discord-ipc";

function testSocketConnection(id) {
  return new Promise((resolve, reject) => {
    const sock = net.createConnection(`${basePath}-${id}`, () => {
      resolve(`connected to discord @ index ${id}`);
      sock.end();
    });

    sock.once("error", err => {
      reject(`error connecting to discord @ index ${id}`);
      sock.end();
    });
  });
}

async function isDiscordRunning() {
  for (let i = 0; i < 10; i++) {
    try {
      const res = await testSocketConnection(i);
      if (res) {
        return true;
      }
    } catch (err) {     
      // Do nothing
    }
  }

  return false;
}

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


module.exports = {
  isDiscordRunning,
  uuid
};
