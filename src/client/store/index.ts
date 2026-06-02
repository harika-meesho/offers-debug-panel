import { configureStore } from '@reduxjs/toolkit';
import debugPanelReducer from './debugPanelSlice';

export const store = configureStore({
  reducer: {
    debugPanel: debugPanelReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
