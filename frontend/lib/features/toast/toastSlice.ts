import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface ToastProps {
    kind: 'error' | 'success' | 'warning' | 'info';
    title: string;
    timeout?: number;
}

export interface ToastState {
  props?: ToastProps;
}

const initialState = { } satisfies ToastState as ToastState

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast(state, action: PayloadAction<ToastProps>) {
      state.props = action.payload;
    },
    clearToast(state) {
      state.props = undefined;
    }
  },
})

export const { addToast, clearToast } = toastSlice.actions
export default toastSlice.reducer