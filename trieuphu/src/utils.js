import { MILESTONES, PRIZES } from './data';

// reason: 'win' | 'wrong' | 'timeout' | 'stop'
export const calcPrize = (correctCount, reason) => {
  if (reason === 'win' || reason === 'stop') {
    return correctCount > 0 ? PRIZES[correctCount - 1] : 0;
  }
  const passed = MILESTONES.filter((m) => m <= correctCount);
  return passed.length > 0 ? PRIZES[passed[passed.length - 1] - 1] : 0;
};
