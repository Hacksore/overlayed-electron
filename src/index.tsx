import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store";
import { StyledEngineProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <StyledEngineProvider injectFirst>        
        <App />
      </StyledEngineProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
