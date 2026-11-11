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

const RATING_SORTS = [
  ['rating', 'Top rated'],
  ['reviews', 'Most reviewed'],
];

// Pass recentLabel on lists that have their own order, like Saved.
export function SortSelect({ value, hasRatings, recentLabel, onChange }) {
  const options = [
    ...(recentLabel ? [['recent', recentLabel]] : []),
    ...(hasRatings ? RATING_SORTS : []),
    ...SORTS,
  ];
  return <Select label="Sort by" value={value} options={options} onChange={onChange} />;
}

export default function Filters({
  type,
  sort,
  hasRatings,
  openNow,
  onTypeChange,
  onSortChange,
  onOpenNowChange,
}) {
  return (
    <div className="filters">
      <Select label="Type" value={type} options={TYPES} onChange={onTypeChange} />
      <SortSelect value={sort} hasRatings={hasRatings} onChange={onSortChange} />
      {hasRatings && (
        <button
          type="button"
          className="toggle"
          aria-pressed={openNow}
          onClick={() => onOpenNowChange(!openNow)}
        >
          <span className="toggle__dot" aria-hidden="true" />
          Open now
        </button>
      )}
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
