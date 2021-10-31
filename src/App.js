import { useEffect, useState } from "react";
import "./App.css";
import Avatar from "./components/Avatar";

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // hey mr main I am ready
    window.electron.send("toMain", "I_AM_READY");

    window.electron.receive("fromMain", (msg) => {
      const packet = JSON.parse(msg);
      // console.log(packet);
      if (packet.cmd === "GET_CHANNEL") {
        console.log("users", packet.data.voice_states);
        setUsers(packet.data.voice_states);
      }

      if (packet.cmd === "DISPATCH" && packet.evt === "SPEAKING_START") {
        setUsers((userList) => {
          const clonedUserList = [...userList];
          clonedUserList.forEach((u) => {
            if (u.user.id === packet.data.user_id) {
              u.isTalking = true;
            }
          });
          return clonedUserList;
        });
      }

      if (packet.cmd === "DISPATCH" && packet.evt === "SPEAKING_STOP") {
        setUsers((userList) => {
          const clonedUserList = [...userList];
          clonedUserList.forEach((u) => {
            if (u.user.id === packet.data.user_id) {
              u.isTalking = false;
            }
          });
          return clonedUserList;
        });
      }

      // join
      if (packet.cmd === "DISPATCH" && packet.evt === "VOICE_STATE_CREATE") {
        console.log("User is joining");
        setUsers((userList) => {
          return [...userList, packet.data];
        });
      }

      // leave
      if (packet.cmd === "DISPATCH" && packet.evt === "VOICE_STATE_DELETE") {
        console.log("User is leaving");
        setUsers((userList) =>
          userList.filter((u) => u.user.id !== packet.data.user.id)
        );
      }
      
      // update user info
      if (packet.cmd === "DISPATCH" && packet.evt === "VOICE_STATE_UPDATE") {
        console.log("User is updating VOICE_STATE_UPDATE", packet.data);

        setUsers((userList) => {
          const oldUsers = userList.filter((u) => u.user.id !== packet.data.user.id);
          return [...oldUsers, packet.data];
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
          WebkitAppRegion: "drag",
        }}
      >
        {users.map((u) => (
          <Avatar
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
