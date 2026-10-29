import { LETTERS } from '../data';

const AnswerButton = ({ index, text, state, hidden, disabled, onClick }) => (
  <button className={`answer ${state}`} disabled={disabled || hidden} onClick={onClick}>
    {hidden ? '' : `${LETTERS[index]}. ${text}`}
  </button>
);

export default AnswerButton;
