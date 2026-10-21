import { useState, useEffect } from 'react';
import GameEngine from './GameEngine';
import './index.css';

import { useColyseus } from './hooks/useColyseus';
import { useLanguage } from './i18n';
import NameEntryScreen from './components/NameEntryScreen';
import PlayersList from './components/PlayersList';
import WeatherWidget from './components/WeatherWidget';
import CurrencyWidget from './components/CurrencyWidget';
import Leaderboard from './components/Leaderboard';
import ToastContainer from './components/ToastContainer';

class AudioSystem {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.muted = false;
  }

  playTone(freq, type, duration, vol = 0.1) {
    if (this.muted || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playOrb() { this.playTone(800, 'sine', 0.1, 0.1); this.playTone(1200, 'sine', 0.2, 0.1); }
  playHit() { this.playTone(100, 'sawtooth', 0.3, 0.2); this.playTone(50, 'square', 0.5, 0.2); }
  playPowerup() { this.playTone(400, 'square', 0.1, 0.1); this.playTone(600, 'square', 0.1, 0.1); this.playTone(800, 'square', 0.3, 0.1); }
  playGameOver() { this.playTone(200, 'sawtooth', 0.5, 0.2); this.playTone(150, 'sawtooth', 0.8, 0.2); this.playTone(100, 'sawtooth', 1.2, 0.2); }
  playClick() { this.playTone(600, 'sine', 0.1, 0.05); }

  toggleMute() { this.muted = !this.muted; return this.muted; }
}

export const audio = new AudioSystem();

function App() {
  const [screen, setScreen] = useState('NAME_ENTRY');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [personalBest, setPersonalBest] = useState(0);
  const [currentPlayerName, setCurrentPlayerName] = useState('');

  const { lang, toggleLang, t } = useLanguage();
  const {
    status, error, players, leaderboard, toasts,
    mySessionId, connect, leave, submitScore, updatePlayerStatus
  } = useColyseus();

  // Переключаемся на главный экран только при успешном подключении
  useEffect(() => {
    if (status === 'connected' && screen === 'NAME_ENTRY') {
      setScreen('START');
    }
  }, [status, screen]);

  const handleConnect = (name) => {
    setCurrentPlayerName(name);
    // Загружаем личный рекорд этого игрока из localStorage
    const saved = parseInt(localStorage.getItem(`cyberDodgeHighScore_${name}`) || '0');
    setPersonalBest(saved);
    connect(name);
  };

  const startGame = () => {
    audio.playClick();
    setScore(0);
    setCombo(0);
    setScreen('PLAYING');
    updatePlayerStatus('playing');
  };

  const gameOver = (finalScore, maxCombo) => {
    audio.playGameOver();
    submitScore(finalScore);
    setScore(finalScore);
    setCombo(maxCombo);

    // Обновляем личный рекорд игрока
    if (finalScore > personalBest) {
      setPersonalBest(finalScore);
      localStorage.setItem(
        `cyberDodgeHighScore_${currentPlayerName}`,
        finalScore.toString()
      );
    }

    setScreen('GAME_OVER');
  };

  const toggleMute = () => setIsMuted(audio.toggleMute());

  const handleLeave = () => {
    audio.playClick();
    updatePlayerStatus('lobby');
    leave();
    setScreen('NAME_ENTRY');
  };

  return (
    <div className="app-container">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      <div className="cyber-grid-container">
        <div className="cyber-grid"></div>
      </div>
      <div className="scanlines"></div>

      {/* Кнопка смены языка */}
      <button
        className="lang-btn"
        onClick={toggleLang}
        title={t('switchLang')}
      >
        {lang.toUpperCase()}
      </button>

      {/* Кнопка громкости */}
      <button className="mute-btn" onClick={toggleMute}>
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Экран ввода имени */}
      {screen === 'NAME_ENTRY' && (
        <NameEntryScreen
          status={status}
          error={error}
          onConnect={handleConnect}
        />
      )}

      {/* Главный экран (лобби) */}
      {screen === 'START' && (
        <>
          <PlayersList players={players} mySessionId={mySessionId} />
          <Leaderboard entries={leaderboard} />
          <div className="screen">
            <h1>CYBER DODGE</h1>
            <div className="subtitle">Survive. Dodge. Dominate.</div>

            <div className="widgets-container">
              <WeatherWidget />
              <CurrencyWidget />
            </div>

            <button className="btn" onClick={startGame}>{t('play')}</button>
            <button className="btn" onClick={() => { audio.playClick(); setScreen('TUTORIAL'); }}>
              {t('howToPlay')}
            </button>
            <button className="btn" onClick={handleLeave}>{t('exit')}</button>
          </div>
        </>
      )}

      {/* Экран обучения */}
      {screen === 'TUTORIAL' && (
        <div className="screen screen-bg" style={{ overflowY: 'auto', padding: '40px 20px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>{t('tutorialTitle')}</h1>
          <div className="stats-panel" style={{ textAlign: 'left', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto', fontSize: '1rem' }}>

            <h3 style={{ color: 'var(--cyan)', borderBottom: '1px solid var(--cyan)', paddingBottom: '5px' }}>
              {t('controlsTitle')}
            </h3>
            <p><strong>{t('controlsDesktop')}</strong> {t('controlsDesktopKeys')}</p>
            <p><strong>{t('controlsMobile')}</strong> {t('controlsMobileDesc')}</p>

            <h3 style={{ color: '#ff5252', borderBottom: '1px solid #ff5252', paddingBottom: '5px', marginTop: '20px' }}>
              {t('hazardsTitle')}
            </h3>
            <p>{t('hazardsDesc')}</p>
            <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
              <li><strong style={{ color: '#ff5252' }}>{t('hazardRed')}</strong> {t('hazardRedDesc')}</li>
              <li><strong style={{ color: '#bb86fc' }}>{t('hazardPurple')}</strong> {t('hazardPurpleDesc')}</li>
              <li><strong style={{ color: '#ff9800' }}>{t('hazardOrange')}</strong> {t('hazardOrangeDesc')}</li>
              <li><strong style={{ color: '#00e676' }}>{t('hazardGreen')}</strong> {t('hazardGreenDesc')}</li>
            </ul>

            <h3 style={{ color: 'var(--cyan)', borderBottom: '1px solid var(--cyan)', paddingBottom: '5px', marginTop: '20px' }}>
              {t('collectiblesTitle')}
            </h3>
            <p>
              <strong style={{ color: 'var(--cyan)' }}>{t('collectiblesOrbs')}</strong>{' '}
              {t('collectiblesOrbsDesc')}
            </p>
            <p style={{ marginTop: '10px' }}>
              <strong style={{ color: 'var(--yellow)' }}>{t('collectiblesPowerups')}</strong>{' '}
              {t('collectiblesPowerupsDesc')}
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
              <li><strong>{t('powerupShield')}</strong> {t('powerupShieldDesc')}</li>
              <li><strong>{t('powerupSlow')}</strong> {t('powerupSlowDesc')}</li>
              <li><strong>{t('powerupDouble')}</strong> {t('powerupDoubleDesc')}</li>
            </ul>

          </div>
          <button
            className="btn"
            style={{ marginTop: '30px' }}
            onClick={() => { audio.playClick(); setScreen('START'); }}
          >
            {t('backToMenu')}
          </button>
        </div>
      )}

      {/* Игра */}
      {screen === 'PLAYING' && (
        <GameEngine personalBest={personalBest} onGameOver={gameOver} />
      )}

      {/* Конец игры */}
      {screen === 'GAME_OVER' && (
        <div className="screen">
          <h1>{t('gameOver')}</h1>
          <div className="stats-panel">
            <div className="stat-row">
              <span className="stat-label">{t('finalScore')}</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">{t('highScore')}</span>
              <span className="stat-value">{personalBest}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">{t('bestCombo')}</span>
              <span className="stat-value">x{combo}</span>
            </div>
          </div>
          <button className="btn" onClick={startGame}>{t('playAgain')}</button>
          <button
            className="btn"
            onClick={() => { audio.playClick(); setScreen('START'); }}
          >
            {t('backToMenu')}
          </button>
        </div>
      )}

      {/* Всплывающие уведомления */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;