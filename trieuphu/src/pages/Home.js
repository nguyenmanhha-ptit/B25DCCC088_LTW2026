import { useNavigate } from 'react-router-dom';
import { PRIZES, TIME_PER_QUESTION, formatMoney } from '../data';

const Home = ({ playerName, onNameChange, history }) => {
  const navigate = useNavigate();
  const best = history.reduce((top, h) => (!top || h.prize > top.prize ? h : top), null);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/play');
  };

  return (
    <div className="home">
      <h1>Ai là triệu phú</h1>
      <ul className="rules">
        <li>Trả lời lần lượt {PRIZES.length} câu hỏi trắc nghiệm về HTML, CSS, ES6, React.</li>
        <li>Mỗi câu có {TIME_PER_QUESTION} giây, hết giờ được tính như trả lời sai.</li>
        <li>Câu 5, 10, 15 là các mốc an toàn. Trả lời sai chỉ nhận tiền của mốc cao nhất đã vượt qua.</li>
        <li>Trả lời đúng cả {PRIZES.length} câu để nhận {formatMoney(PRIZES[PRIZES.length - 1])}.</li>
      </ul>
      {best && (
        <p className="record">
          Kỷ lục: {formatMoney(best.prize)} – {best.name}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <label>
          Tên người chơi:{' '}
          <input value={playerName} onChange={(e) => onNameChange(e.target.value)} />
        </label>{' '}
        <button type="submit" disabled={!playerName.trim()}>
          Bắt đầu
        </button>
      </form>
    </div>
  );
};

export default Home;
