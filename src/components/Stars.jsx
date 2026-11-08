const STAR = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z';

function Row({ size }) {
  return [0, 1, 2, 3, 4].map((i) => (
    <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={STAR} fill="currentColor" />
    </svg>
  ));
}

export default function Stars({ rating, size = 14 }) {
  const percent = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span className="stars" role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      <span className="stars__row stars__row--empty">
        <Row size={size} />
      </span>
      <span className="stars__row stars__row--full" style={{ width: `${percent}%` }}>
        <Row size={size} />
      </span>
    </span>
  );
}
