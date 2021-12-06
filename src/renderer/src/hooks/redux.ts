import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { HistoryState, RootState, AppDispatch, HistoryDispatch } from "../store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// hist
export const useHistoryDispatch = () => useDispatch<HistoryDispatch>();
export const useHistorySelector: TypedUseSelectorHook<HistoryState> = useSelector;
