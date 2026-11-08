export const GOOGLE_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '').trim();
export const GOOGLE_MAP_ID = (import.meta.env.VITE_GOOGLE_MAP_ID ?? '').trim() || 'DEMO_MAP_ID';
export const USE_GOOGLE = GOOGLE_KEY.length > 0;
