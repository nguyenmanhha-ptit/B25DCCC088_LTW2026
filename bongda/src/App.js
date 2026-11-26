import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useFetch from './hooks/useFetch';
import useLocalStorage from './hooks/useLocalStorage';
import useDebounce from './hooks/useDebounce';
import { removeMatch, selectMatches, setGoals, setMatches } from './features/matchesSlice';
import { hasSaved } from './store';
import { useTheme } from './context/ThemeContext';
import { useNotice } from './context/NoticeContext';
import StandingsTable from './components/StandingsTable';
import AddMatchForm from './components/AddMatchForm';
import GoalPlanner from './components/GoalPlanner';
import MatchRow from './components/MatchRow';
import { RESULT_LABELS, ROUNDS } from './data';
import { calcMatchStats, calcStandings, getTeamName } from './utils';

const BUILD_TAG = "bd-5918";

const TITLE = 'Giải bóng đá khoa';

const App = () => {
  const { data, loading, error } = useFetch('/data/matches.json');
  const matches = useSelector(selectMatches);
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const showNotice = useNotice();
  const [round, setRound] = useLocalStorage('ltw_bongda_round', 'all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const searchRef = useRef(null);

  // Chỉ nạp dữ liệu mẫu khi chưa có lịch thi đấu đã lưu
  useEffect(() => {
    if (!hasSaved && data) dispatch(setMatches(data));
  }, [data, dispatch]);

  const standings = useMemo(() => calcStandings(matches), [matches]);
  const roundMatches = useMemo(
    () => (round === 'all' ? matches : matches.filter((m) => m.round === Number(round))),
    [matches, round]
  );
  const visibleMatches = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase();
    return roundMatches.filter(
      (m) =>
        getTeamName(m.home).toLowerCase().includes(keyword) ||
        getTeamName(m.away).toLowerCase().includes(keyword)
    );
  }, [roundMatches, debouncedSearch]);
  const stats = useMemo(() => calcMatchStats(roundMatches), [roundMatches]);
  const leader = matches.length > 0 ? standings[0] : null;

  useEffect(() => {
    document.title = leader ? `${leader.name} dẫn đầu – ${TITLE}` : TITLE;
  }, [leader]);

  // Phím tắt: "/" nhảy vào ô Tìm đội, Esc xóa nội dung tìm kiếm
  useEffect(() => {
    const handleKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) {
        e.preventDefault();
        searchRef.current.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        setSearch('');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleTeamShift = (e) => setSearch(e.target.value);

  const handleGoals = useCallback((payload) => dispatch(setGoals(payload)), [dispatch]);

  const handleRemove = useCallback(
    (match) => {
      dispatch(removeMatch(match.id));
      showNotice(`Đã xóa trận ${getTeamName(match.home)} - ${getTeamName(match.away)}`);
    },
    [dispatch, showNotice]
  );

  const handleReset = () => {
    dispatch(setMatches(data));
    showNotice('Đã đặt lại dữ liệu mẫu');
  };

  const renderContent = () => {
    if (!hasSaved && loading) return <p>Đang tải lịch thi đấu...</p>;
    if (!hasSaved && error) return <p>Không tải được lịch thi đấu</p>;
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
          <h3>Phân bố kết quả</h3>
          <ul className="distribution">
            {Object.entries(RESULT_LABELS).map(([key, label]) => (
              <li key={key}>
                {label}: {stats.counts[key]}{' '}
                <span className="bar" style={{ width: `${24 * stats.counts[key]}px` }} />
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Lịch thi đấu</h2>
          <div className="filters">
            <label htmlFor="round-filter">Xem vòng </label>
            <select id="round-filter" value={round} onChange={(e) => setRound(e.target.value)}>
              <option value="all">Tất cả</option>
              {ROUNDS.map((r) => (
                <option key={r} value={r}>
                  Vòng {r}
                </option>
              ))}
            </select>
            <label htmlFor="search">Tìm đội </label>
            <input
              id="search"
              ref={searchRef}
              value={search}
              onChange={handleTeamShift}
              placeholder="Nhấn / để tìm"
            />
          </div>
          <p>Tìm thấy {visibleMatches.length} trận</p>
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
                  <th>Số lần render</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibleMatches.map((m) => (
                  <MatchRow key={m.id} match={m} onGoals={handleGoals} onRemove={handleRemove} />
                ))}
              </tbody>
            </table>
          )}
          <button className="reset" onClick={handleReset} disabled={!data}>
            Đặt lại dữ liệu mẫu
          </button>
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
      <h1>{TITLE}</h1>
      <button onClick={toggleTheme}>{theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}</button>
      {renderContent()}
    </div>
  );
};

export default App;
