import { useId } from 'react';
import { CheckIcon, ChevronDownIcon } from './Icons.jsx';

const TYPES = [
  ['restaurants', 'Restaurants'],
  ['hotels', 'Hotels'],
  ['attractions', 'Attractions'],
];

const SORTS = [
  ['distance', 'Nearest first'],
  ['name', 'Name (A–Z)'],
];

const RATING_SORTS = [
  ['rating', 'Top rated'],
  ['reviews', 'Most reviewed'],
];

// The small "Top rated ⌄" picker that sits on the right, above a list.
// Pass recentLabel on lists that have their own order, like Saved.
export function SortSelect({ value, hasRatings, recentLabel, onChange }) {
  const id = useId();
  const options = [
    ...(recentLabel ? [['recent', recentLabel]] : []),
    ...(hasRatings ? RATING_SORTS : []),
    ...SORTS,
  ];
  return (
    <div className="sort">
      <label className="visually-hidden" htmlFor={id}>
        Sort by
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="sort__chevron" size={14} />
    </div>
  );
}

export default function Filters({ type, hasHours, openNow, onTypeChange, onOpenNowChange }) {
  return (
    <div className="pills" role="group" aria-label="Filters">
      {TYPES.map(([value, label]) => (
        <button
          key={value}
          type="button"
          className="pill"
          aria-pressed={type === value}
          onClick={() => onTypeChange(value)}
        >
          {label}
        </button>
      ))}
      {hasHours && (
        <button
          type="button"
          className="pill pill--open"
          aria-pressed={openNow}
          onClick={() => onOpenNowChange(!openNow)}
        >
          {openNow && <CheckIcon size={14} />}
          Open now
        </button>
      )}
    </div>
  );
}
