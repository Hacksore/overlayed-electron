import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";
import historyReducer from "./reducers/historyReducer";
import rootReducer from "./reducers/rootReducer";

const isProd = process.env.NODE_ENV === "production";

const FILTERD_EVENTS: Array<string> = ["root/updateUser", "root/setUserTalking"];
const logger = createLogger({
  // @ts-ignore
  predicate: (_, action) => !isProd && !FILTERD_EVENTS.includes(action.type),
});

export const store = configureStore({
  reducer: {
    root: rootReducer,
    history: historyReducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger),

});


export type RootState = ReturnType<typeof store.getState>;
export type HistoryState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export type HistoryDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState | HistoryState,
  unknown,
  Action<string>
>;
