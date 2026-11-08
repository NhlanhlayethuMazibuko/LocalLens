import { useId } from 'react';
import { ChevronDownIcon } from './Icons.jsx';

const TYPES = [
  ['restaurants', 'Restaurants'],
  ['hotels', 'Hotels'],
  ['attractions', 'Attractions'],
];

const SORTS = [
  ['distance', 'Nearest first'],
  ['name', 'Name (A–Z)'],
];

const SORTS_WITH_RATING = [['rating', 'Top rated'], ...SORTS];

export default function Filters({ type, sort, hasRatings, onTypeChange, onSortChange }) {
  return (
    <div className="filters">
      <Select label="Type" value={type} options={TYPES} onChange={onTypeChange} />
      <Select
        label="Sort by"
        value={sort}
        options={hasRatings ? SORTS_WITH_RATING : SORTS}
        onChange={onSortChange}
      />
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  const id = useId();
  return (
    <div className="select">
      <label className="select__label" htmlFor={id}>
        {label}
      </label>
      <div className="select__field">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map(([optionValue, optionLabel]) => (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="select__chevron" />
      </div>
    </div>
  );
}
