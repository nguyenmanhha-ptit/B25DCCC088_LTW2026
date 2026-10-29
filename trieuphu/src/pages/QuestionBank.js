import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LEVELS } from '../data';

const QuestionBank = ({ questions }) => {
  const [level, setLevel] = useState('all');
  const [query, setQuery] = useState('');

  const handleQueryShift = (e) => setQuery(e.target.value);

  const keyword = query.trim().toLowerCase();
  const filtered = questions.filter(
    (q) =>
      (level === 'all' || q.level === Number(level)) &&
      q.question.toLowerCase().includes(keyword)
  );

  return (
    <div>
      <h2>Ngân hàng câu hỏi</h2>
      <div className="filters">
        <label>
          Mức độ:{' '}
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="all">Tất cả</option>
            {Object.entries(LEVELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tìm kiếm:{' '}
          <input value={query} onChange={handleQueryShift} placeholder="Nội dung câu hỏi" />
        </label>
      </div>
      <p>Có {filtered.length} câu hỏi</p>
      <table className="table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Mức độ</th>
            <th>Câu hỏi</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((q) => (
            <tr key={q.id}>
              <td>{q.id}</td>
              <td>{LEVELS[q.level]}</td>
              <td className="left">
                <Link to={`/questions/${q.id}`}>{q.question}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionBank;
