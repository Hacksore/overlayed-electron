import { useEffect, useState } from "react";
import "./App.css";
import UserItem from "./components/UserItem";
import { DiscordCMDEvents, DiscordRPCEvents } from "./constants/discord";
// import IPCSocketService from "./services/socketService";
import { insertItemAtIndex } from "./utils";

declare global {
  // TODO: type this as a proper type
  interface Window { electron: any; }
}

function App() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    // hey mr main I am ready
    window.electron.send("toMain", "I_AM_READY");
    // TODO: this has to be a singleton service I think - will look at working with IPCSocketService later
    // we end up with way to many stale closures with async callbacks like this that need to ready react state vars
    window.electron.receive("fromMain", (msg: any) => {
      const packet = JSON.parse(msg);

      if (packet.cmd === DiscordRPCEvents.GET_CHANNEL) {
        console.log("users", packet.data.voice_states);
        setUsers(packet.data.voice_states);        
      }

      if (packet.cmd === DiscordCMDEvents.DISPATCH && packet.evt === DiscordRPCEvents.SPEAKING_START) {
        setUsers((userList) => {
          const clonedUserList = [...userList];
          clonedUserList.forEach((u: any) => {
            if (u.user.id === packet.data.user_id) {
              u.isTalking = true;
            }
          });
          return clonedUserList;
        });
      }

      if (packet.cmd === DiscordCMDEvents.DISPATCH && packet.evt === DiscordRPCEvents.SPEAKING_STOP) {
        setUsers((userList) => {
          const clonedUserList = [...userList];
          clonedUserList.forEach((u: any) => {
            if (u.user.id === packet.data.user_id) {
              u.isTalking = false;
            }
          });
          return clonedUserList;
        });
      }

      // join
      if (packet.cmd === DiscordCMDEvents.DISPATCH && packet.evt === DiscordRPCEvents.VOICE_STATE_CREATE) {
        console.log("User is joining");
        // @ts-ignore
        setUsers((userList: any) => {
          return [...userList, packet.data];
        });
      }

      // leave
      if (packet.cmd === DiscordCMDEvents.DISPATCH && packet.evt === DiscordRPCEvents.VOICE_STATE_DELETE) {
        console.log("User is leaving");
        setUsers((userList: any) =>
          userList.filter((u: any) => u.user.id !== packet.data.user.id)
        );
      }
      
      // update user info
      if (packet.cmd === DiscordCMDEvents.DISPATCH && packet.evt === DiscordRPCEvents.VOICE_STATE_UPDATE) {
        console.log("User is updating VOICE_STATE_UPDATE", packet.data);
        
        // @ts-ignore
        setUsers((userList: any) => {
          // preserve last index so they dont move around
          const lastIndex = userList.findIndex((u: any) => u.user.id === packet.data.user.id);
          const oldUsers = userList.filter((u: any) => u.user.id !== packet.data.user.id);
          return insertItemAtIndex([...oldUsers], lastIndex, packet.data);
        });
      }

    });
  }, []);

  return (
    <div className="App">
      <button
        className="button"
        onClick={() => window.electron.send("toMain", "TOGGLE_PIN")}
        style={{}}
      >
        📌
      </button>
      <div
        style={{
          // @ts-ignore
          WebkitAppRegion: "drag",
        }}
      >
        {users.map((u: any) => (
          <UserItem
            key={u.user.id}
            nick={u.nick}
            userId={u.user.id}
            avatarHash={u.user.avatar}
            isTalking={u.isTalking}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
