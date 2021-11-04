import { IconButton } from "@mui/material";
import IconPin from "@mui/icons-material/PushPinRounded";
import IconSettings from "@mui/icons-material/Settings";
import IconDebug from "@mui/icons-material/BugReport";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { appSlice } from "../rootReducer";
import { RootState } from "../store";

const {
  setPinned,
} = appSlice.actions;

const Toolbar = () => {
  const dispatch = useAppDispatch();
  const isPinned = useAppSelector((state: RootState) => state.root.isPinned);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <div
        style={{
          textTransform: "uppercase",
          fontSize: 20,
          flex: 1,
          display: "flex",
          color: "#fff",
        }}
      >
        overlayed™
      </div>
      <IconButton onClick={() => window.electron.send("toMain", { event: "TOGGLE_DEVTOOLS" })}>
        <IconDebug style={{ color: "#fff" }} />
      </IconButton>
      <IconButton onClick={() => window.open("?test")}>
        <IconSettings style={{ color: "#fff" }} />
      </IconButton>
      <IconButton
        onClick={() => {
          window.electron.send("toMain", { event: "TOGGLE_PIN" });
          // TODO: dont leave state on UI the main proc should handle it
          dispatch(setPinned(!isPinned));
        }}
      >
        <IconPin style={{ color: isPinned ? "#73ef5b" : "#fff" }} />
      </IconButton>
    </div>
  );
};

export default Toolbar;