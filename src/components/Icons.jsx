function Icon({ size = 20, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

export const ChevronDownIcon = (p) => (
  <Icon size={16} {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

export const ChevronLeftIcon = (p) => (
  <Icon {...p}>
    <path d="M15 18l-6-6 6-6" />
  </Icon>
);

export const ChevronRightIcon = (p) => (
  <Icon size={16} {...p}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
);

export const ArrowLeftIcon = (p) => (
  <Icon size={16} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
);

export const DirectionsIcon = (p) => (
  <Icon size={16} {...p}>
    <path d="M12 3 5 20l7-4 7 4z" />
  </Icon>
);

export const StarIcon = ({ size = 12, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
  </svg>
);

export const PinIcon = (p) => (
  <Icon size={14} {...p}>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Icon>
);

export const ClockIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);

export const PhoneIcon = (p) => (
  <Icon {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />
  </Icon>
);

export const GlobeIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
  </Icon>
);

export const HeartIcon = ({ filled, ...p }) => (
  <Icon {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  </Icon>
);

export const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
);

export const SunIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
);

export const MoonIcon = (p) => (
  <Icon {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </Icon>
);

export const NoPhotoIcon = (p) => (
  <Icon {...p}>
    <path d="M3 3l18 18" />
    <path d="M21 16V5a2 2 0 0 0-2-2H8" />
    <path d="M3 7v12a2 2 0 0 0 2 2h12" />
    <path d="m3 16 5-5 3 3" />
    <circle cx="15.5" cy="8.5" r="1.5" />
  </Icon>
);

const CLOUD = 'M7 17h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 8.5 4.25 4.25 0 0 0 7 17z';

const WEATHER_SHAPES = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />,
  partly: (
    <>
      <path d="M8 2.5v1.5M3.5 4.5l1 1M2 9h1.5M12.5 4.5l-1 1" />
      <path d="M5.3 11.5A3.5 3.5 0 0 1 11.6 7" />
      <path d="M9 21h8a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 8 15.2 3 3 0 0 0 9 21z" />
    </>
  ),
  cloud: <path d={CLOUD} />,
  fog: <path d="M4 8h16M3 12h18M5 16h14M8 20h8" />,
  rain: (
    <>
      <path d={CLOUD} />
      <path d="M8 19.5l-1 2M12 19.5l-1 2M16 19.5l-1 2" />
    </>
  ),
  snow: (
    <>
      <path d={CLOUD} />
      <path d="M8 20h.01M12 21.5h.01M16 20h.01" />
    </>
  ),
  storm: (
    <>
      <path d={CLOUD} />
      <path d="M12.5 14l-2 3.5h3l-2 3.5" />
    </>
  ),
};

export const WeatherIcon = ({ name, ...p }) => (
  <Icon {...p}>{WEATHER_SHAPES[name] ?? WEATHER_SHAPES.cloud}</Icon>
);
