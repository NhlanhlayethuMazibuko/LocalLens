export default function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--logo-bg)" />
      <circle cx="16" cy="16" r="5" fill="var(--accent)" />
    </svg>
  );
}
