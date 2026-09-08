import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showAlert: false,
  message: '',
  isActingAsUser:false
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setShowAlert: (state, action) => {
      state.showAlert = true;
      state.message = action.payload;
    },
    hideAlert: (state) => {
      state.showAlert = false;
      state.message = '';
    },
    setIsActingAsUser: (state, action) => {
      state.isActingAsUser = action.payload; 
    },
  },
});

export const { setShowAlert, hideAlert } = alertSlice.actions;
export default alertSlice.reducer; 