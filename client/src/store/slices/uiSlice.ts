import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  activeNotificationCount: number;
}

const initialState: UiState = {
  sidebarOpen: true,
  theme: 'dark',
  activeNotificationCount: 3,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    incrementNotificationCount: (state) => {
      state.activeNotificationCount += 1;
    },
    clearNotificationCount: (state) => {
      state.activeNotificationCount = 0;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  incrementNotificationCount,
  clearNotificationCount,
} = uiSlice.actions;

export default uiSlice.reducer;
