import { MILESTONES, PRIZES, formatMoney } from '../data';

const MoneyLadder = ({ current }) => (
  <ul className="ladder">
    {PRIZES.map((prize, i) => {
      const number = i + 1;
      const classes = [
        number === current ? 'current' : '',
        MILESTONES.includes(number) ? 'milestone' : '',
      ].join(' ');
      return (
        <li key={number} className={classes}>
          <span>{number}</span>
          <span>{formatMoney(prize)}</span>
        </li>
      );
    })}
  </ul>
);

export default MoneyLadder;
