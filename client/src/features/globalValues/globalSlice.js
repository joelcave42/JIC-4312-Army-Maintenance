import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  inputValues: { name: "", email: "", password: "" },
  statusListener: false,
};

const globalSlice = createSlice({
  name: "globalValues",
  initialState,
  reducers: {
    resetInputValues: (state) => {
      state.inputValues = { name: "", email: "", password: "" };
    },
    updateNameInputValue: (state, action) => {
      state.inputValues.name = action.payload.name;
    },
    updateEmailInputValue: (state, action) => {
      state.inputValues.email = action.payload.email;
    },
    updatePasswordInputValue: (state, action) => {
      state.inputValues.password = action.payload.password;
    },
    changeStatusListener: (state) => {
      state.statusListener = !state.statusListener;
    },
  },
});

// Export actions
export const {
  resetInputValues,
  updateNameInputValue,
  updateEmailInputValue,
  updatePasswordInputValue,
  changeStatusListener,
} = globalSlice.actions;

export default globalSlice.reducer;
