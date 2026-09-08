import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showToast: false,
  message: '',
  type: '',
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    setShowToast: (state, action) => {
      state.showToast = true;
      state.message = action.payload.message;
      state.type = action.payload.type;
    },
    hideToast: (state) => {
      state.showToast = false;
      state.message = '';
      state.type = '';
    },
  },
});

export const { setShowToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer; 