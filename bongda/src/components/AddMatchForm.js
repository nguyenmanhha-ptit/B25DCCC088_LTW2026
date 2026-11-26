import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMatch, selectMatches } from '../features/matchesSlice';
import { useNotice } from '../context/NoticeContext';
import { ROUNDS, TEAMS } from '../data';
import { getTeamName, isValidGoals } from '../utils';

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

const AddMatchForm = () => {
  const matches = useSelector(selectMatches);
  const dispatch = useDispatch();
  const showNotice = useNotice();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const homeRef = useRef(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(form, matches);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const home = Number(form.home);
    const away = Number(form.away);
    dispatch(
      addMatch({
        round: Number(form.round),
        home,
        away,
        homeGoals: Number(form.homeGoals),
        awayGoals: Number(form.awayGoals),
      })
    );
    showNotice(`Đã thêm trận ${getTeamName(home)} - ${getTeamName(away)}`);
    setForm(EMPTY_FORM);
    homeRef.current.focus();
  };

  return (
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
  );
};

export default AddMatchForm;
