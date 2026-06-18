import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface IToast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface UIState {
  loading: boolean;
  activeRequests: number;
  toasts: IToast[];
}

const initialState: UIState = {
  loading: false,
  activeRequests: 0,
  toasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    startRequest: (state) => {
      state.activeRequests += 1;
      state.loading = state.activeRequests > 0;
    },
    endRequest: (state) => {
      state.activeRequests = Math.max(0, state.activeRequests - 1);
      state.loading = state.activeRequests > 0;
    },
    addToast: (state, action: PayloadAction<Omit<IToast, "id">>) => {
      const id = Math.random().toString(36).substring(2, 11);
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { startRequest, endRequest, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
