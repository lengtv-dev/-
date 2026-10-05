import { WatchHistoryItem, UserProfile } from '../types/stream';

const LOGIN_KEY = 'xtream_login';
const PROFILES_KEY = 'stream_profiles';
const ACTIVE_PROFILE_KEY = 'stream_active_profile';
const FAVORITES_KEY = 'stream_favorites';
const PIN_KEY = 'playid_pin';
const ADULT_ENABLED_KEY = 'playid_show_adult';
const THEME_KEY = 'Playldtheme';

export interface SavedAuth {
  server: string;
  anyname: string;
  user: string;
  pass: string;
  remember: boolean;
}

export const getSavedAuth = (): SavedAuth | null => {
  try {
    const raw = localStorage.getItem(LOGIN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

export const saveAuth = (auth: SavedAuth) => {
  if (auth.remember) {
    localStorage.setItem(LOGIN_KEY, JSON.stringify(auth));
  } else {
    localStorage.removeItem(LOGIN_KEY);
  }
};

export const clearAuth = () => {
  localStorage.removeItem(LOGIN_KEY);
};

// Profiles
export const getProfiles = (): UserProfile[] => {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    { id: 'default', name: 'สมาชิกทั่วไป', avatarUrl: '/src/assets/images/avatar_streamer_1791216941283.jpg', createdAt: Date.now() },
  ];
};

export const saveProfiles = (profiles: UserProfile[]) => {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

export const getActiveProfile = (): UserProfile => {
  const profiles = getProfiles();
  const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);
  const found = profiles.find((p) => p.id === activeId);
  return found || profiles[0];
};

export const setActiveProfile = (id: string) => {
  localStorage.setItem(ACTIVE_PROFILE_KEY, id);
};

// History
export const getHistoryKey = (user: string, server: string): string => {
  return `history_${btoa(encodeURIComponent(`${server}_${user}`))}`;
};

export const getHistory = (user: string, server: string): WatchHistoryItem[] => {
  try {
    const raw = localStorage.getItem(getHistoryKey(user, server));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

export const saveHistoryItem = (user: string, server: string, item: WatchHistoryItem) => {
  const list = getHistory(user, server).filter(
    (x) => !(x.kind === item.kind && String(x.id) === String(item.id))
  );
  list.unshift({ ...item, ts: Date.now() });
  localStorage.setItem(getHistoryKey(user, server), JSON.stringify(list.slice(0, 30)));
};

// Favorites
export const getFavorites = (): string[] => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const toggleFavorite = (itemId: string | number): boolean => {
  const strId = String(itemId);
  const list = getFavorites();
  const idx = list.indexOf(strId);
  let isFav = false;
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(strId);
    isFav = true;
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
  return isFav;
};

export const isFavorite = (itemId: string | number): boolean => {
  return getFavorites().includes(String(itemId));
};

// Adult PIN
export const getAdultPin = (): string | null => {
  return localStorage.getItem(PIN_KEY);
};

export const setAdultPin = (pin: string) => {
  localStorage.setItem(PIN_KEY, pin);
};

export const isAdultEnabled = (): boolean => {
  return localStorage.getItem(ADULT_ENABLED_KEY) === 'true';
};

export const setAdultEnabled = (enabled: boolean) => {
  localStorage.setItem(ADULT_ENABLED_KEY, enabled ? 'true' : 'false');
};

// Theme
export const getSavedTheme = (): 'dark' | 'light' => {
  return (localStorage.getItem(THEME_KEY) as 'dark' | 'light') || 'dark';
};

export const saveTheme = (theme: 'dark' | 'light') => {
  localStorage.setItem(THEME_KEY, theme);
};
