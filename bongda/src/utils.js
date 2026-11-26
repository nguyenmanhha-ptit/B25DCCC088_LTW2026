import { MAX_GOALS, POINTS, TEAMS } from './data';

export const getTeamName = (id) => TEAMS.find((t) => t.id === id)?.name ?? '';

export const getResult = (match) => {
  if (match.homeGoals > match.awayGoals) return 'home';
  if (match.homeGoals < match.awayGoals) return 'away';
  return 'draw';
};

export const isValidGoals = (n) => Number.isInteger(n) && n >= 0 && n <= MAX_GOALS;

const addResult = (row, gf, ga) => {
  row.played += 1;
  row.gf += gf;
  row.ga += ga;
  row.diff = row.gf - row.ga;
  if (gf > ga) {
    row.won += 1;
    row.points += POINTS.win;
  } else if (gf === ga) {
    row.drawn += 1;
    row.points += POINTS.draw;
  } else {
    row.lost += 1;
    row.points += POINTS.loss;
  }
};

export const calcStandings = (matches) => {
  // Mảng mới, các object mới → sửa và sắp xếp không đụng tới state
  const rows = TEAMS.map((t) => ({
    id: t.id,
    name: t.name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    diff: 0,
    points: 0,
  }));
  matches.forEach((m) => {
    const home = rows.find((r) => r.id === m.home);
    const away = rows.find((r) => r.id === m.away);
    if (home) addResult(home, m.homeGoals, m.awayGoals);
    if (away) addResult(away, m.awayGoals, m.homeGoals);
  });
  return rows.sort(
    (a, b) =>
      b.points - a.points || b.diff - a.diff || b.gf - a.gf || a.name.localeCompare(b.name, 'vi')
  );
};

export const calcMatchStats = (matches) => {
  const count = matches.length;
  const goals = matches.reduce((sum, m) => sum + m.homeGoals + m.awayGoals, 0);
  const average = count > 0 ? Math.round((goals / count) * 100) / 100 : 0;
  const counts = matches.reduce(
    (acc, m) => ({ ...acc, [getResult(m)]: acc[getResult(m)] + 1 }),
    { home: 0, draw: 0, away: 0 }
  );
  return { count, goals, average, counts };
};

const toInt = (s) => (String(s).trim() === '' ? NaN : Number(s));

export const calcNeeded = (standings, teamId, target, remaining) => {
  const team = standings.find((t) => t.id === Number(teamId));
  const goal = toInt(target);
  const left = toInt(remaining);
  if (!team || !Number.isInteger(goal) || goal < 0 || !Number.isInteger(left) || left < 1) {
    return 'Hãy chọn đội, nhập số điểm mục tiêu (từ 0) và số trận còn lại (từ 1)';
  }
  const need = goal - team.points;
  if (need <= 0) return 'Đội đã đạt mục tiêu';
  if (need > 3 * left) return 'Không thể đạt mục tiêu này';
  const wins = Math.max(0, Math.ceil((need - left) / 2));
  return `Cần thêm ${need} điểm ở ${left} trận còn lại, tối thiểu ${wins} trận thắng`;
};
