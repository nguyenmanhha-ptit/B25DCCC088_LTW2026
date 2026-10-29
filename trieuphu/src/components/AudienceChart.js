import { LETTERS } from '../data';

const AudienceChart = ({ percents }) => (
  <div className="audience">
    {percents.map((p, i) => (
      <div key={LETTERS[i]} className="audience-row">
        <span className="audience-label">
          {LETTERS[i]}: {p}%
        </span>
        <div className="audience-bar" style={{ width: `${p}%` }} />
      </div>
    ))}
  </div>
);

export default AudienceChart;
