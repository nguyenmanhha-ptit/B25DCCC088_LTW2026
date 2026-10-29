import AnswerButton from './AnswerButton';

const getState = (i, status, selected, answer) => {
  if (status === 'locked' && i === selected) return 'selected';
  if (status === 'revealed' && i === answer) return 'correct';
  if (status === 'revealed' && i === selected) return 'wrong';
  return '';
};

const QuestionCard = ({ number, total, question, status, selected, hidden, onChoose }) => (
  <div className="question-card">
    <p className="question-number">
      Câu {number}/{total}
    </p>
    <p className="question-text">{question.question}</p>
    <div className="answers">
      {question.options.map((option, i) => (
        <AnswerButton
          key={i}
          index={i}
          text={option}
          state={getState(i, status, selected, question.answer)}
          hidden={hidden.includes(i)}
          disabled={status !== 'answering'}
          onClick={() => onChoose(i)}
        />
      ))}
    </div>
  </div>
);

export default QuestionCard;
