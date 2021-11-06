import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";
import rootReducer from "./reducers/rootReducer";

const FILTERD_EVENTS: Array<string> = ["root/setUserTalking"];
const logger = createLogger({
  // @ts-ignore
  predicate: (_, action) => !FILTERD_EVENTS.includes(action.type),
});

export const store = configureStore({
  reducer: {
    root: rootReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
