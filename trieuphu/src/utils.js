import { MILESTONES, PRIZES } from './data';

// reason: 'win' | 'wrong' | 'timeout' | 'stop'
export const calcPrize = (correctCount, reason) => {
  if (reason === 'win' || reason === 'stop') {
    return correctCount > 0 ? PRIZES[correctCount - 1] : 0;
  }
  const passed = MILESTONES.filter((m) => m <= correctCount);
  return passed.length > 0 ? PRIZES[passed[passed.length - 1] - 1] : 0;
};

const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

// 50:50 — chọn ngẫu nhiên 2 đáp án sai để ẩn
export const pickHiddenOptions = (answer) => {
  const wrong = [0, 1, 2, 3].filter((i) => i !== answer);
  const keep = wrong[randInt(0, wrong.length - 1)];
  return wrong.filter((i) => i !== keep);
};

// Hỏi khán giả — trả về mảng % cho A, B, C, D (tổng 100)
export const audiencePoll = (answer, hidden) => {
  const others = [0, 1, 2, 3].filter((i) => i !== answer && !hidden.includes(i));
  // Đáp án đúng 40–70% và luôn cao hơn từng đáp án sai
  const correct = randInt(Math.max(40, Math.floor(100 / (others.length + 1)) + 1), 70);
  const cap = correct - 1;
  const percents = [0, 0, 0, 0];
  percents[answer] = correct;
  let rest = 100 - correct;
  others.forEach((i, idx) => {
    const left = others.length - idx - 1;
    const share = left === 0 ? rest : randInt(Math.max(0, rest - left * cap), Math.min(rest, cap));
    percents[i] = share;
    rest -= share;
  });
  return percents;
};
