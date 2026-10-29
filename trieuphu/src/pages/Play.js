import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';
import MoneyLadder from '../components/MoneyLadder';
import Lifelines from '../components/Lifelines';
import AudienceChart from '../components/AudienceChart';
import { LETTERS, PRIZES, TIME_PER_QUESTION } from '../data';
import { audiencePoll, calcPrize, pickHiddenOptions } from '../utils';

const TOTAL = PRIZES.length;

const Play = ({ questions, playerName, onFinish }) => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  // "answering" → "locked" → "revealed"
  const [status, setStatus] = useState('answering');
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [hidden, setHidden] = useState([]);
  const [audience, setAudience] = useState(null);
  const [used, setUsed] = useState({ fifty: false, audience: false });

  const question = questions[index];

  const finish = (correctCount, reason) => {
    const prize = calcPrize(correctCount, reason);
    onFinish({ name: playerName, prize, correctCount });
    navigate('/result', {
      replace: true,
      state: { name: playerName, prize, correctCount, reason },
    });
  };

  const nextQuestion = () => {
    setIndex((i) => i + 1);
    setSelected(null);
    setTimeLeft(TIME_PER_QUESTION);
    setHidden([]);
    setAudience(null);
    setStatus('answering');
  };

  const choose = useCallback(
    (i) => {
      if (status !== 'answering' || hidden.includes(i)) return;
      setSelected(i);
      setStatus('locked');
    },
    [status, hidden]
  );

  const handleFifty = () => {
    setHidden(pickHiddenOptions(question.answer));
    setUsed({ ...used, fifty: true });
  };

  const handleAudience = () => {
    setAudience(audiencePoll(question.answer, hidden));
    setUsed({ ...used, audience: true });
  };

  const handleStop = () => finish(index, 'stop');

  // Đồng hồ: chỉ chạy khi đang trả lời
  useEffect(() => {
    if (status !== 'answering') return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [status, index]);

  // Hết giờ: lộ đáp án đúng, coi như trả lời sai
  useEffect(() => {
    if (timeLeft === 0 && status === 'answering') setStatus('revealed');
  }, [timeLeft, status]);

  // Chờ 1 giây lộ kết quả, thêm 2 giây sang câu tiếp / kết thúc
  useEffect(() => {
    if (status === 'locked') {
      const id = setTimeout(() => setStatus('revealed'), 1000);
      return () => clearTimeout(id);
    }
    if (status === 'revealed') {
      const id = setTimeout(() => {
        if (selected !== question.answer) {
          finish(index, selected === null ? 'timeout' : 'wrong');
        } else if (index + 1 === TOTAL) {
          finish(TOTAL, 'win');
        } else {
          nextQuestion();
        }
      }, 2000);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Phím tắt A–D
  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const i = LETTERS.indexOf(e.key.toUpperCase());
      if (i !== -1) choose(i);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [choose]);

  // Tiêu đề tab
  useEffect(() => {
    document.title = `Câu ${index + 1}/${TOTAL} – ${playerName}`;
    return () => {
      document.title = 'Ai là triệu phú';
    };
  }, [index, playerName]);

  return (
    <div className="play">
      <div className="play-main">
        <Timer timeLeft={timeLeft} />
        <QuestionCard
          number={index + 1}
          total={TOTAL}
          question={question}
          status={status}
          selected={selected}
          hidden={hidden}
          onChoose={choose}
        />
        <Lifelines
          used={used}
          disabled={status !== 'answering'}
          onFifty={handleFifty}
          onAudience={handleAudience}
          onStop={handleStop}
        />
        {audience && <AudienceChart percents={audience} />}
      </div>
      <MoneyLadder current={index + 1} />
    </div>
  );
};

export default Play;
