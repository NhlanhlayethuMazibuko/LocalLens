export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--primary)" />
      <circle cx="14" cy="14" r="7" stroke="var(--text-on-primary)" strokeWidth="3" />
      <path d="M19.5 19.5L25 25" stroke="var(--text-on-primary)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M14 18.5s-3-2.6-3-5a3 3 0 0 1 6 0c0 2.4-3 5-3 5z" fill="var(--accent)" />
    </svg>
  );
}
