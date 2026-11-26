import { memo, useRef } from 'react';
import { RESULT_LABELS } from '../data';
import { getResult, getTeamName, isValidGoals } from '../utils';

const MatchRow = memo(({ match, onGoals, onRemove }) => {
  const renders = useRef(0);
  renders.current += 1;

  const home = getTeamName(match.home);
  const away = getTeamName(match.away);
  const result = getResult(match);

  const handleGoals = (key, e) => {
    const n = e.target.valueAsNumber;
    if (!isValidGoals(n)) return;
    onGoals({ id: match.id, homeGoals: match.homeGoals, awayGoals: match.awayGoals, [key]: n });
  };

  return (
    <tr className={result === 'draw' ? 'draw' : ''}>
      <td>{match.round}</td>
      <td className="left">{home}</td>
      <td>
        <input
          type="number"
          min="0"
          max="20"
          aria-label={`Bàn thắng nhà ${home} - ${away}`}
          value={match.homeGoals}
          onChange={(e) => handleGoals('homeGoals', e)}
        />
      </td>
      <td>
        <input
          type="number"
          min="0"
          max="20"
          aria-label={`Bàn thắng khách ${home} - ${away}`}
          value={match.awayGoals}
          onChange={(e) => handleGoals('awayGoals', e)}
        />
      </td>
      <td className="left">{away}</td>
      <td>{RESULT_LABELS[result]}</td>
      <td>{renders.current}</td>
      <td>
        <button onClick={() => onRemove(match)}>Xóa</button>
      </td>
    </tr>
  );
});

export default MatchRow;
