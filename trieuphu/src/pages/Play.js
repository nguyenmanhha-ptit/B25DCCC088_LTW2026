import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';
import MoneyLadder from '../components/MoneyLadder';
import { PRIZES, TIME_PER_QUESTION } from '../data';
import { calcPrize } from '../utils';

const TOTAL = PRIZES.length;

const Play = ({ questions, playerName }) => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  // "answering" → "locked" → "revealed"
  const [status, setStatus] = useState('answering');
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);

  const question = questions[index];

  const finish = (correctCount, reason) => {
    const prize = calcPrize(correctCount, reason);
    navigate('/result', {
      replace: true,
      state: { name: playerName, prize, correctCount, reason },
    });
  };

  const nextQuestion = () => {
    setIndex((i) => i + 1);
    setSelected(null);
    setTimeLeft(TIME_PER_QUESTION);
    setStatus('answering');
  };

  const choose = (i) => {
    if (status !== 'answering') return;
    setSelected(i);
    setStatus('locked');
  };

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
          hidden={[]}
          onChoose={choose}
        />
      </div>
      <MoneyLadder current={index + 1} />
    </div>
  );
};

export default Play;
