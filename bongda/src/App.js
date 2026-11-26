import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useFetch from './hooks/useFetch';
import { removeMatch, selectMatches, setGoals, setMatches } from './features/matchesSlice';
import { useTheme } from './context/ThemeContext';
import { useNotice } from './context/NoticeContext';
import StandingsTable from './components/StandingsTable';
import AddMatchForm from './components/AddMatchForm';
import GoalPlanner from './components/GoalPlanner';
import { RESULT_LABELS, ROUNDS } from './data';
import { calcMatchStats, calcStandings, getResult, getTeamName, isValidGoals } from './utils';

const BUILD_TAG = "bd-5918";

const App = () => {
  const { data, loading, error } = useFetch('/data/matches.json');
  const matches = useSelector(selectMatches);
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const showNotice = useNotice();
  const [round, setRound] = useState('all');

  useEffect(() => {
    if (data) dispatch(setMatches(data));
  }, [data, dispatch]);

  const standings = useMemo(() => calcStandings(matches), [matches]);
  const roundMatches = useMemo(
    () => (round === 'all' ? matches : matches.filter((m) => m.round === Number(round))),
    [matches, round]
  );
  const stats = useMemo(() => calcMatchStats(roundMatches), [roundMatches]);
  const leader = matches.length > 0 ? standings[0] : null;

  const handleGoals = (match, key, e) => {
    const n = e.target.valueAsNumber;
    if (!isValidGoals(n)) return;
    dispatch(
      setGoals({ id: match.id, homeGoals: match.homeGoals, awayGoals: match.awayGoals, [key]: n })
    );
  };

  const handleRemove = (match) => {
    dispatch(removeMatch(match.id));
    showNotice(`Đã xóa trận ${getTeamName(match.home)} - ${getTeamName(match.away)}`);
  };

  const renderContent = () => {
    if (loading) return <p>Đang tải lịch thi đấu...</p>;
    if (error) return <p>Không tải được lịch thi đấu</p>;
    return (
      <>
        <section>
          <h2>Bảng xếp hạng</h2>
          <StandingsTable standings={standings} />
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
                        <button onClick={() => handleRemove(m)}>Xóa</button>
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
          <AddMatchForm />
        </section>

        <section>
          <h2>Mục tiêu điểm</h2>
          <GoalPlanner standings={standings} />
        </section>
      </>
    );
  };

  return (
    <div className={`app ${theme}`} data-build={BUILD_TAG}>
      <h1>Giải bóng đá khoa</h1>
      <button onClick={toggleTheme}>{theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}</button>
      {renderContent()}
    </div>
  );
};

export default App;
