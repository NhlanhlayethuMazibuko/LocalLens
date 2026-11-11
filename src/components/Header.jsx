import { useState } from 'react';
import Logo from './Logo.jsx';
import { MoonIcon, SearchIcon, SunIcon } from './Icons.jsx';
import { searchLocations } from '../lib/api.js';
import './Header.css';

export default function Header({ theme, onToggleTheme, onPickLocation }) {
  const isDark = theme === 'dark';
  return (
    <header className="header">
      <div className="header__brand">
        <Logo />
        <span className="header__name">LocalLens</span>
      </div>
      <button
        type="button"
        className="icon-btn header__theme"
        onClick={onToggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Light mode' : 'Dark mode'}
      >
        {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
      </button>
      <SearchBox onPick={onPickLocation} />
    </header>
  );
}

function SearchBox({ onPick }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');
  const [open, setOpen] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const text = query.trim();
    if (!text) return;
    setStatus('loading');
    setOpen(true);
    try {
      const found = await searchLocations(text);
      setResults(found);
      setStatus(found.length ? 'idle' : 'empty');
    } catch {
      setStatus('error');
    }
  }

  function pick(result) {
    onPick(result);
    setQuery(result.name.split(',')[0]);
    setOpen(false);
  }

  return (
    <form className="search" role="search" onSubmit={handleSubmit}>
      <SearchIcon className="search__icon" size={18} />
      <input
        className="search__input"
        type="search"
        aria-label="Search for a city"
        placeholder="Search a city or area"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      />
      {open && (
        <ul className="search__results">
          {status === 'loading' && <li className="search__note">Looking it up…</li>}
          {status === 'empty' && <li className="search__note">Never heard of it. Try another spelling?</li>}
          {status === 'error' && <li className="search__note">Search tripped over. Try again in a sec.</li>}
          {status === 'idle' &&
            results.map((r) => {
              const [first, ...rest] = r.name.split(', ');
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    className="search__result"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(r)}
                  >
                    <strong>{first}</strong>
                    <span className="muted">{rest.join(', ')}</span>
                  </button>
                </li>
              );
            })}
        </ul>
      )}
    </form>
  );
}
