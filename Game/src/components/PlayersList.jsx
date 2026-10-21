import { useLanguage } from '../i18n';

function statusIcon(status) {
  if (status === 'playing') return '🎮';
  if (status === 'left') return '💤';
  return '🏠';
}

function statusTitle(status, t) {
  if (status === 'playing') return t('statusPlaying');
  if (status === 'left') return t('statusLeft');
  return t('statusLobby');
}

export default function PlayersList({ players, mySessionId }) {
  const { t } = useLanguage();

  // Активные сверху, "вышедшие" — снизу
  const sorted = [...players].sort((a, b) => {
    const aLeft = a.status === 'left' ? 1 : 0;
    const bLeft = b.status === 'left' ? 1 : 0;
    if (aLeft !== bLeft) return aLeft - bLeft;
    return a.joinedAt - b.joinedAt;
  });

  // Считаем только тех, кто не 'left'
  const activeCount = players.filter((p) => p.status !== 'left').length;

  return (
    <div className="players-panel">
      <h3>{t('playersOnline')} ({activeCount})</h3>
      <ul className="players-ul">
        {sorted.map((p) => {
          const isMe = p.sessionId === mySessionId;
          const status = p.status || 'lobby';
          const isLeft = status === 'left';
          return (
            <li
              key={p.sessionId}
              className={`player-item ${isMe ? 'player-me' : ''} ${isLeft ? 'player-left' : ''}`}
              title={statusTitle(status, t)}
            >
              <span className="player-name">
                <span className="player-status">{statusIcon(status)}</span>
                {isMe ? '▶ ' : ''}{p.name}
              </span>
              <span className="player-score">{p.score}</span>
            </li>
          );
        })}
        {players.length === 0 && (
          <li className="player-empty">{t('noPlayers')}</li>
        )}
      </ul>
    </div>
  );
}