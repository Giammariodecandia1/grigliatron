/**
 * Temi dinamici per tipo di evento.
 * Ogni tema definisce colori, emoji, icone e microcopy.
 */
const themes = {
  grigliata: {
    id: 'grigliata',
    label: 'Grigliata',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #D32F2F 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(211,47,47,0.10) 100%)',
    accent: '#FF6B35',
    accentLight: 'rgba(255,107,53,0.15)',
    headerEmoji: '🔥',
    tagline: 'Fuoco, carne e buona compagnia',
    sectionEmojis: {
      countdown: '⏱️',
      participants: '👥',
      food: '🥩',
      gear: '⛺',
      tasks: '📋',
      location: '📍',
      weather: '🌤️',
      expenses: '💰',
      updates: '📢',
      reviews: '⭐',
    },
    emptyMessages: {
      food: 'Nessuna carne sulla griglia... ancora!',
      gear: 'Serve qualcosa? Aggiungi qui!',
      tasks: 'Tutto fatto? Oppure nessuno ha iniziato 😄',
      updates: 'Silenzio radio. Nessun aggiornamento.',
      reviews: 'L\'evento non è ancora finito!',
    },
  },
  compleanno: {
    id: 'compleanno',
    label: 'Compleanno',
    gradient: 'linear-gradient(135deg, #E040FB 0%, #7C4DFF 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(224,64,251,0.15) 0%, rgba(124,77,255,0.10) 100%)',
    accent: '#E040FB',
    accentLight: 'rgba(224,64,251,0.15)',
    headerEmoji: '🎂',
    tagline: 'Festa, regali e risate',
    sectionEmojis: {
      countdown: '🎉',
      participants: '🥳',
      food: '🍰',
      gear: '🎈',
      tasks: '🎁',
      location: '📍',
      weather: '🌤️',
      expenses: '💰',
      updates: '📢',
      reviews: '⭐',
    },
    emptyMessages: {
      food: 'Niente da mangiare? Impossibile!',
      gear: 'Palloncini? Musica? Aggiungi qui!',
      tasks: 'Chi compra la torta?',
      updates: 'Nessun aggiornamento ancora.',
      reviews: 'La festa non è ancora finita!',
    },
  },
  cena: {
    id: 'cena',
    label: 'Cena',
    gradient: 'linear-gradient(135deg, #FFB74D 0%, #FF7043 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(255,183,77,0.15) 0%, rgba(255,112,67,0.10) 100%)',
    accent: '#FFB74D',
    accentLight: 'rgba(255,183,77,0.15)',
    headerEmoji: '🍷',
    tagline: 'Buon cibo, buon vino, buona compagnia',
    sectionEmojis: {
      countdown: '⏱️',
      participants: '👥',
      food: '🍝',
      gear: '🍽️',
      tasks: '📋',
      location: '📍',
      weather: '🌤️',
      expenses: '💰',
      updates: '📢',
      reviews: '⭐',
    },
    emptyMessages: {
      food: 'Il menu è ancora vuoto!',
      gear: 'Tovaglie? Candele? Aggiungi qui!',
      tasks: 'Chi prenota il ristorante?',
      updates: 'Tutto tranquillo per ora.',
      reviews: 'La cena non è ancora finita!',
    },
  },
  viaggio: {
    id: 'viaggio',
    label: 'Viaggio',
    gradient: 'linear-gradient(135deg, #26C6DA 0%, #1565C0 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(38,198,218,0.15) 0%, rgba(21,101,192,0.10) 100%)',
    accent: '#26C6DA',
    accentLight: 'rgba(38,198,218,0.15)',
    headerEmoji: '🗺️',
    tagline: 'Zaino in spalla e si parte',
    sectionEmojis: {
      countdown: '✈️',
      participants: '🧳',
      food: '🥪',
      gear: '🎒',
      tasks: '📋',
      location: '📍',
      weather: '🌤️',
      expenses: '💰',
      updates: '📢',
      reviews: '⭐',
    },
    emptyMessages: {
      food: 'Snack per il viaggio? Aggiungi!',
      gear: 'Non dimenticare il caricatore!',
      tasks: 'Chi guida?',
      updates: 'Nessun aggiornamento.',
      reviews: 'Il viaggio non è ancora finito!',
    },
  },
  uscita: {
    id: 'uscita',
    label: 'Uscita',
    gradient: 'linear-gradient(135deg, #66BB6A 0%, #2E7D32 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(102,187,106,0.15) 0%, rgba(46,125,50,0.10) 100%)',
    accent: '#66BB6A',
    accentLight: 'rgba(102,187,106,0.15)',
    headerEmoji: '🌿',
    tagline: 'Aria fresca e buona compagnia',
    sectionEmojis: {
      countdown: '⏱️',
      participants: '👥',
      food: '🍕',
      gear: '🎒',
      tasks: '📋',
      location: '📍',
      weather: '🌤️',
      expenses: '💰',
      updates: '📢',
      reviews: '⭐',
    },
    emptyMessages: {
      food: 'Qualcosa da sgranocchiare?',
      gear: 'Cosa serve? Aggiungi qui!',
      tasks: 'Niente da fare? Beati voi!',
      updates: 'Nessuna novità.',
      reviews: "L'uscita non è ancora finita!",
    },
  },
};

export const colorPalettes = {
  default: { id: 'default', label: 'Predefinito (da tema)', gradient: null, accent: null, gradientSubtle: null, accentLight: null },
  sunset: { id: 'sunset', label: 'Tramonto', gradient: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)', accent: '#FF512F', gradientSubtle: 'linear-gradient(135deg, rgba(255,81,47,0.15) 0%, rgba(221,36,118,0.10) 100%)', accentLight: 'rgba(255,81,47,0.15)' },
  ocean: { id: 'ocean', label: 'Oceano', gradient: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)', accent: '#2193b0', gradientSubtle: 'linear-gradient(135deg, rgba(33,147,176,0.15) 0%, rgba(109,213,237,0.10) 100%)', accentLight: 'rgba(33,147,176,0.15)' },
  forest: { id: 'forest', label: 'Foresta', gradient: 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)', accent: '#71B280', gradientSubtle: 'linear-gradient(135deg, rgba(19,78,94,0.15) 0%, rgba(113,178,128,0.10) 100%)', accentLight: 'rgba(113,178,128,0.15)' },
  neon: { id: 'neon', label: 'Neon Night', gradient: 'linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)', accent: '#E94057', gradientSubtle: 'linear-gradient(135deg, rgba(138,35,135,0.15) 0%, rgba(242,113,33,0.10) 100%)', accentLight: 'rgba(233,64,87,0.15)' },
  wine: { id: 'wine', label: 'Vino Rosso', gradient: 'linear-gradient(135deg, #4b134f 0%, #c94b4b 100%)', accent: '#c94b4b', gradientSubtle: 'linear-gradient(135deg, rgba(75,19,79,0.15) 0%, rgba(201,75,75,0.10) 100%)', accentLight: 'rgba(201,75,75,0.15)' },
  ice: { id: 'ice', label: 'Ghiaccio', gradient: 'linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)', accent: '#789DCA', gradientSubtle: 'linear-gradient(135deg, rgba(224,234,252,0.4) 0%, rgba(207,222,243,0.4) 100%)', accentLight: 'rgba(120,157,202,0.15)' },
  midnight: { id: 'midnight', label: 'Mezzanotte', gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)', accent: '#414345', gradientSubtle: 'linear-gradient(135deg, rgba(35,37,38,0.15) 0%, rgba(65,67,69,0.10) 100%)', accentLight: 'rgba(65,67,69,0.15)' },
  gold: { id: 'gold', label: 'Oro', gradient: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 50%, #B38728 100%)', accent: '#BF953F', gradientSubtle: 'linear-gradient(135deg, rgba(191,149,63,0.15) 0%, rgba(179,135,40,0.10) 100%)', accentLight: 'rgba(191,149,63,0.15)' },
  candy: { id: 'candy', label: 'Caramella', gradient: 'linear-gradient(135deg, #f953c6 0%, #b91d73 100%)', accent: '#f953c6', gradientSubtle: 'linear-gradient(135deg, rgba(249,83,198,0.15) 0%, rgba(185,29,115,0.10) 100%)', accentLight: 'rgba(249,83,198,0.15)' },
};

export function getTheme(eventType, colorPaletteId = null) {
  const baseTheme = themes[eventType] || themes.uscita;
  if (colorPaletteId && colorPalettes[colorPaletteId] && colorPaletteId !== 'default') {
    const palette = colorPalettes[colorPaletteId];
    return {
      ...baseTheme,
      gradient: palette.gradient,
      gradientSubtle: palette.gradientSubtle,
      accent: palette.accent,
      accentLight: palette.accentLight,
    };
  }
  return baseTheme;
}

export function getThemeList() {
  return Object.values(themes).map(t => ({ id: t.id, label: t.label, emoji: t.headerEmoji }));
}

export function getPaletteList() {
  return Object.values(colorPalettes);
}

export default themes;
