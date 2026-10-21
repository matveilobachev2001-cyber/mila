import { createContext, useContext, useState, useEffect, createElement } from 'react';

// ====== Все переводы игры ======
export const translations = {
  en: {
    enterName: 'ENTER YOUR NAME',
    connect: 'CONNECT',
    connecting: 'CONNECTING...',
    errorLabel: 'Error',
    playersOnline: 'PLAYERS ONLINE',
    noPlayers: 'No one here...',
    exit: 'EXIT',
    howToPlay: 'HOW TO PLAY',
    play: 'PLAY',
    tutorialTitle: 'HOW TO PLAY',
    controlsTitle: '🎮 CONTROLS',
    controlsDesktop: 'Desktop:',
    controlsDesktopKeys: 'Left / Right Arrow Keys or A / D',
    controlsMobile: 'Mobile:',
    controlsMobileDesc: 'Tap the left or right side of the screen',
    hazardsTitle: '⚠️ HAZARDS (AVOID)',
    hazardsDesc: 'The longer you survive, the faster they fall. Watch out for variants!',
    hazardRed: 'Red Blocks:',
    hazardRedDesc: 'Standard dropping hazards.',
    hazardPurple: 'Purple Blocks:',
    hazardPurpleDesc: 'Lightning fast dropping speed.',
    hazardOrange: 'Orange Blocks:',
    hazardOrangeDesc: 'Massive size, hard to dodge.',
    hazardGreen: 'Green Blocks:',
    hazardGreenDesc: 'Sweeps from side to side!',
    collectiblesTitle: '💎 COLLECTIBLES (GRAB)',
    collectiblesOrbs: 'Cyan Orbs:',
    collectiblesOrbsDesc: 'Grants points and builds your COMBO. The higher your combo, the more points everything is worth!',
    collectiblesPowerups: 'Yellow Power-Ups:',
    collectiblesPowerupsDesc: 'Grants a random temporary boost (5 seconds):',
    powerupShield: '🛡️ SHIELD:',
    powerupShieldDesc: 'Absorbs exactly one collision.',
    powerupSlow: '⏱️ SLOW:',
    powerupSlowDesc: 'Cuts the falling speed of all blocks in half.',
    powerupDouble: '2️⃣ DOUBLE:',
    powerupDoubleDesc: 'Doubles all points earned while active.',
    backToMenu: 'BACK TO MENU',
    gameOver: 'GAME OVER',
    finalScore: 'FINAL SCORE',
    highScore: 'HIGH SCORE',
    bestCombo: 'BEST COMBO',
    playAgain: 'PLAY AGAIN',
    weatherIn: 'Weather in Cheboksary',
    weatherTemperature: 'Temperature',
    weatherWind: 'Wind',
    weatherLoading: 'Loading weather...',
    usdRate: 'USD RATE (CBR)',
    switchLang: 'Switch language',
    leaderboard: 'LEADERBOARD',
    noRecords: 'No records yet',
    statusLobby: 'In lobby',
    statusPlaying: 'Playing',
    joinedLobby: 'joined the lobby',
    leftLobby: 'left the lobby',
    statusLeft: 'Left',
    changeName: 'Change name',
  },

  ru: {
    enterName: 'ВВЕДИТЕ ИМЯ',
    connect: 'ПОДКЛЮЧИТЬСЯ',
    connecting: 'ПОДКЛЮЧЕНИЕ...',
    errorLabel: 'Ошибка',
    playersOnline: 'ИГРОКИ ОНЛАЙН',
    noPlayers: 'Никого нет...',
    exit: 'ВЫЙТИ',
    howToPlay: 'КАК ИГРАТЬ',
    play: 'ИГРАТЬ',
    tutorialTitle: 'КАК ИГРАТЬ',
    controlsTitle: '🎮 УПРАВЛЕНИЕ',
    controlsDesktop: 'Компьютер:',
    controlsDesktopKeys: 'Стрелки влево / вправо или A / D',
    controlsMobile: 'Мобильный:',
    controlsMobileDesc: 'Тапните по левой или правой части экрана',
    hazardsTitle: '⚠️ ОПАСНОСТИ (ИЗБЕГАЙ)',
    hazardsDesc: 'Чем дольше выживаешь, тем быстрее они падают. Осторожно — есть варианты!',
    hazardRed: 'Красные блоки:',
    hazardRedDesc: 'Стандартные падающие препятствия.',
    hazardPurple: 'Фиолетовые блоки:',
    hazardPurpleDesc: 'Падают с огромной скоростью.',
    hazardOrange: 'Оранжевые блоки:',
    hazardOrangeDesc: 'Огромный размер, трудно уклониться.',
    hazardGreen: 'Зелёные блоки:',
    hazardGreenDesc: 'Двигаются из стороны в сторону!',
    collectiblesTitle: '💎 БОНУСЫ (СОБИРАЙ)',
    collectiblesOrbs: 'Голубые сферы:',
    collectiblesOrbsDesc: 'Дают очки и увеличивают КОМБО. Чем выше комбо, тем больше очков за всё!',
    collectiblesPowerups: 'Жёлтые усиления:',
    collectiblesPowerupsDesc: 'Дают случайный временный бонус (5 секунд):',
    powerupShield: '🛡️ ЩИТ:',
    powerupShieldDesc: 'Поглощает одно столкновение.',
    powerupSlow: '⏱️ ЗАМЕДЛЕНИЕ:',
    powerupSlowDesc: 'Вдвое уменьшает скорость падения блоков.',
    powerupDouble: '2️⃣ ДВОЙНОЙ:',
    powerupDoubleDesc: 'Удваивает все получаемые очки.',
    backToMenu: 'В МЕНЮ',
    gameOver: 'ИГРА ОКОНЧЕНА',
    finalScore: 'ИТОГОВЫЙ СЧЁТ',
    highScore: 'ЛУЧШИЙ СЧЁТ',
    bestCombo: 'ЛУЧШЕЕ КОМБО',
    playAgain: 'ИГРАТЬ СНОВА',
    weatherIn: 'Погода в Чебоксарах',
    weatherTemperature: 'Температура',
    weatherWind: 'Ветер',
    weatherLoading: 'Загрузка погоды...',
    usdRate: 'КУРС ДОЛЛАРА ЦБ РФ',
    switchLang: 'Сменить язык',
    leaderboard: 'ТАБЛИЦА РЕКОРДОВ',
    noRecords: 'Рекордов пока нет',
    statusLobby: 'В лобби',
    statusPlaying: 'Играет',
    joinedLobby: 'подключился к лобби',
    leftLobby: 'покинул игру',
    statusLeft: 'Вышел',
    changeName: 'Сменить имя',
  },
};

// ====== React Context ======
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('cyberDodgeLang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('cyberDodgeLang', lang);
  }, [lang]);

  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'ru' : 'en'));

  const t = (key) => translations[lang][key] ?? key;

  // Используем createElement вместо JSX, чтобы файл был валидным .js
  return createElement(
    LanguageContext.Provider,
    { value: { lang, setLang, toggleLang, t } },
    children
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return ctx;
}