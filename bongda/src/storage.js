const KEY = 'ltw_bongda_matches';

export const loadSaved = () => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === null) return null;
    const data = JSON.parse(saved);
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
};

export const saveMatches = (matches) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(matches));
  } catch {
    // Bỏ qua khi trình duyệt không cho ghi (hết dung lượng, chế độ riêng tư...)
  }
};
