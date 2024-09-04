import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducers";

const store = configureStore({
  reducer: {
    name: rootReducer,
  },
});

export default store;
