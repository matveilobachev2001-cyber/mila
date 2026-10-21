import { useLanguage } from '../i18n';

export default function ToastContainer({ toasts }) {
  const { t } = useLanguage();

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const isJoin = toast.type === 'join';
        return (
          <div
            key={toast.id}
            className={`toast ${isJoin ? 'toast-join' : 'toast-leave'}`}
          >
            {isJoin ? '▶ ' : '◀ '}
            <strong>{toast.name}</strong>{' '}
            {isJoin ? t('joinedLobby') : t('leftLobby')}
          </div>
        );
      })}
    </div>
  );
}