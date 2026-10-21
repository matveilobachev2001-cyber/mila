import { useState } from 'react';
import { useLanguage } from '../i18n';

const NAME_STORAGE_KEY = 'cyberDodgePlayerName';

export default function NameEntryScreen({ onConnect, status, error }) {
  const { t } = useLanguage();
  const [name, setName] = useState(() => localStorage.getItem(NAME_STORAGE_KEY) || '');
  const isConnecting = status === 'connecting';

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem(NAME_STORAGE_KEY, trimmed);
    onConnect(trimmed);
  };

  const handleClear = () => {
    localStorage.removeItem(NAME_STORAGE_KEY);
    setName('');
  };

  const hasSaved = !!localStorage.getItem(NAME_STORAGE_KEY);

  return (
    <div className="screen">
      <h1>CYBER DODGE</h1>
      <div className="subtitle">Survive. Dodge. Dominate.</div>

      <form onSubmit={handleSubmit} className="name-form">
        <label className="name-label">{t('enterName')}</label>
        <input
          type="text"
          className="name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          placeholder="Player"
          disabled={isConnecting}
          autoFocus
        />
        <button
          type="submit"
          className="btn"
          disabled={isConnecting || !name.trim()}
        >
          {isConnecting ? t('connecting') : t('connect')}
        </button>

        {hasSaved && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClear}
            disabled={isConnecting}
          >
            {t('changeName')}
          </button>
        )}
      </form>

      {error && <div className="name-error">{t('errorLabel')}: {error}</div>}
    </div>
  );
}