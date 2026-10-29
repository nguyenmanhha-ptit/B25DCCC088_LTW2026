import { useNavigate, useParams } from 'react-router-dom';
import { LETTERS, LEVELS } from '../data';

const QuestionDetail = ({ questions }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const question = questions.find((q) => q.id === Number(id));

  return (
    <div>
      {question ? (
        <>
          <h2>
            Câu hỏi số {question.id} ({LEVELS[question.level]})
          </h2>
          <p className="question-text">{question.question}</p>
          <ul className="options">
            {question.options.map((option, i) => (
              <li key={i} className={i === question.answer ? 'correct' : ''}>
                {LETTERS[i]}. {option}
                {i === question.answer && ' (Đáp án đúng)'}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Không tìm thấy câu hỏi</p>
      )}
      <button onClick={() => navigate(-1)}>Quay lại</button>
    </div>
  );
};

export default QuestionDetail;
