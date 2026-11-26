import { configureStore } from '@reduxjs/toolkit';
import matchesReducer from './features/matchesSlice';
import goalReducer from './features/goalSlice';
import { loadSaved, saveMatches } from './storage';

const saved = loadSaved();

// Đã có lịch thi đấu lưu từ lần trước chưa
export const hasSaved = saved !== null;

export const store = configureStore({
  reducer: {
    matches: matchesReducer,
    goal: goalReducer,
  },
  preloadedState: { matches: saved ?? [] },
});

// Chỉ lưu khi mảng trận đấu đổi tham chiếu
let lastMatches = store.getState().matches;
store.subscribe(() => {
  const { matches } = store.getState();
  if (matches !== lastMatches) {
    lastMatches = matches;
    saveMatches(matches);
  }
});
