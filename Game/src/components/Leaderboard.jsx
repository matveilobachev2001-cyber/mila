import { useLanguage } from '../i18n';

export default function Leaderboard({ entries }) {
  const { t } = useLanguage();

  return (
    <div className="leaderboard-panel">
      <h3>🏆 {t('leaderboard')}</h3>
      <ul className="leaderboard-list">
        {entries.length === 0 && (
          <li className="leaderboard-empty">{t('noRecords')}</li>
        )}
        {entries.map((entry, idx) => (
          <li key={`${entry.name}-${entry.date}-${idx}`} className="leaderboard-item">
            <span className="leaderboard-rank">#{idx + 1}</span>
            <span className="leaderboard-name" title={entry.name}>{entry.name}</span>
            <span className="leaderboard-score">{entry.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}