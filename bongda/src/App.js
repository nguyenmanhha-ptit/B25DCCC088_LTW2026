import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import useFetch from './hooks/useFetch';
import matchesReducer from './matchesReducer';
import { RESULT_LABELS, ROUNDS, TEAMS, formatDiff } from './data';
import { calcMatchStats, calcStandings, getResult, getTeamName, isValidGoals } from './utils';

const BUILD_TAG = "bd-5918";

const EMPTY_FORM = { round: '1', home: '', away: '', homeGoals: '', awayGoals: '' };
const GOALS_ERROR = 'Số bàn thắng phải là số nguyên từ 0 đến 20';

const validate = (form, matches) => {
  const errors = {};
  const home = Number(form.home);
  const away = Number(form.away);
  if (!form.home) errors.home = 'Hãy chọn đội nhà';
  if (!form.away) errors.away = 'Hãy chọn đội khách';
  else if (form.home && home === away) errors.away = 'Hai đội phải khác nhau';
  else if (
    form.home &&
    matches.some(
      (m) => (m.home === home && m.away === away) || (m.home === away && m.away === home)
    )
  ) {
    errors.away = 'Hai đội đã đá với nhau rồi';
  }
  ['homeGoals', 'awayGoals'].forEach((key) => {
    if (form[key].trim() === '' || !isValidGoals(Number(form[key]))) errors[key] = GOALS_ERROR;
  });
  return errors;
};

const App = () => {
  const { data, loading, error } = useFetch('/data/matches.json');
  const [matches, dispatch] = useReducer(matchesReducer, []);
  const [round, setRound] = useState('all');
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const homeRef = useRef(null);

  useEffect(() => {
    if (data) dispatch({ type: 'LOAD', payload: data });
  }, [data]);

  const standings = useMemo(() => calcStandings(matches), [matches]);
  const roundMatches = useMemo(
    () => (round === 'all' ? matches : matches.filter((m) => m.round === Number(round))),
    [matches, round]
  );
  const stats = useMemo(() => calcMatchStats(roundMatches), [roundMatches]);
  const leader = matches.length > 0 ? standings[0] : null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(form, matches);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    dispatch({
      type: 'ADD',
      payload: {
        round: Number(form.round),
        home: Number(form.home),
        away: Number(form.away),
        homeGoals: Number(form.homeGoals),
        awayGoals: Number(form.awayGoals),
      },
    });
    setForm(EMPTY_FORM);
    homeRef.current.focus();
  };

  const handleGoals = (match, key, e) => {
    const n = e.target.valueAsNumber;
    if (!isValidGoals(n)) return;
    dispatch({
      type: 'SET_GOALS',
      payload: { id: match.id, homeGoals: match.homeGoals, awayGoals: match.awayGoals, [key]: n },
    });
  };

  if (loading) return <p className="app">Đang tải lịch thi đấu...</p>;
  if (error) return <p className="app">Không tải được lịch thi đấu</p>;

  return (
    <div className="app" data-build={BUILD_TAG}>
      <h1>Giải bóng đá khoa</h1>

      <section>
        <h2>Bảng xếp hạng</h2>
        <table>
          <thead>
            <tr>
              <th>Hạng</th>
              <th>Đội</th>
              <th>Trận</th>
              <th>Thắng</th>
              <th>Hòa</th>
              <th>Thua</th>
              <th>BT</th>
              <th>BB</th>
              <th>HS</th>
              <th>Điểm</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((t, i) => (
              <tr key={t.id} className={i === standings.length - 1 ? 'last' : ''}>
                <td>{i + 1}</td>
                <td className="left">{t.name}</td>
                <td>{t.played}</td>
                <td>{t.won}</td>
                <td>{t.drawn}</td>
                <td>{t.lost}</td>
                <td>{t.gf}</td>
                <td>{t.ga}</td>
                <td>{formatDiff(t.diff)}</td>
                <td>{t.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Thống kê</h2>
        <p>Số trận: {stats.count}</p>
        <p>Tổng số bàn thắng: {stats.goals}</p>
        <p>Bàn thắng mỗi trận: {stats.average.toFixed(2)}</p>
        <p>Đội dẫn đầu: {leader ? `${leader.name} (${leader.points} điểm)` : '—'}</p>
      </section>

      <section>
        <h2>Lịch thi đấu</h2>
        <label htmlFor="round-filter">Xem vòng </label>
        <select id="round-filter" value={round} onChange={(e) => setRound(e.target.value)}>
          <option value="all">Tất cả</option>
          {ROUNDS.map((r) => (
            <option key={r} value={r}>
              Vòng {r}
            </option>
          ))}
        </select>
        {roundMatches.length === 0 ? (
          <p>Chưa có trận đấu nào</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Vòng</th>
                <th>Đội nhà</th>
                <th>BT nhà</th>
                <th>BT khách</th>
                <th>Đội khách</th>
                <th>Kết quả</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {roundMatches.map((m) => {
                const home = getTeamName(m.home);
                const away = getTeamName(m.away);
                const result = getResult(m);
                return (
                  <tr key={m.id} className={result === 'draw' ? 'draw' : ''}>
                    <td>{m.round}</td>
                    <td className="left">{home}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        aria-label={`Bàn thắng nhà ${home} - ${away}`}
                        value={m.homeGoals}
                        onChange={(e) => handleGoals(m, 'homeGoals', e)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        aria-label={`Bàn thắng khách ${home} - ${away}`}
                        value={m.awayGoals}
                        onChange={(e) => handleGoals(m, 'awayGoals', e)}
                      />
                    </td>
                    <td className="left">{away}</td>
                    <td>{RESULT_LABELS[result]}</td>
                    <td>
                      <button onClick={() => dispatch({ type: 'REMOVE', payload: m.id })}>Xóa</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Thêm trận đấu</h2>
        <form className="match-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="round">Vòng</label>
            <select id="round" name="round" value={form.round} onChange={handleChange}>
              {ROUNDS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="home">Đội nhà</label>
            <select id="home" name="home" ref={homeRef} value={form.home} onChange={handleChange}>
              <option value="">-- Chọn đội --</option>
              {TEAMS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {errors.home && <p role="alert">{errors.home}</p>}
          </div>
          <div className="field">
            <label htmlFor="away">Đội khách</label>
            <select id="away" name="away" value={form.away} onChange={handleChange}>
              <option value="">-- Chọn đội --</option>
              {TEAMS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {errors.away && <p role="alert">{errors.away}</p>}
          </div>
          <div className="field">
            <label htmlFor="homeGoals">Bàn thắng đội nhà</label>
            <input id="homeGoals" name="homeGoals" type="number" value={form.homeGoals} onChange={handleChange} />
            {errors.homeGoals && <p role="alert">{errors.homeGoals}</p>}
          </div>
          <div className="field">
            <label htmlFor="awayGoals">Bàn thắng đội khách</label>
            <input id="awayGoals" name="awayGoals" type="number" value={form.awayGoals} onChange={handleChange} />
            {errors.awayGoals && <p role="alert">{errors.awayGoals}</p>}
          </div>
          <button type="submit">Thêm trận</button>
        </form>
      </section>
    </div>
  );
};

export default App;
