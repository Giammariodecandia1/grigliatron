/**
 * Template pre-compilati per eventi.
 * Ogni template è una "base di partenza", non un menù completo.
 * Vengono AGGIUNTI al contenuto esistente, mai sovrascrivono.
 */
const templates = {
  grigliata: {
    id: 'grigliata',
    label: 'Grigliata classica',
    emoji: '🔥',
    description: 'Carne, verdure, birra e carbonella — il classico.',
    foodItems: [
      { name: 'Salsicce', quantity: '2 kg', category: 'Carne', notes: '' },
      { name: 'Bistecche', quantity: '1.5 kg', category: 'Carne', notes: '' },
      { name: 'Costine', quantity: '1 kg', category: 'Carne', notes: '' },
      { name: 'Pane', quantity: '3 filoni', category: 'Pane', notes: '' },
      { name: 'Verdure grigliate', quantity: '', category: 'Verdure', notes: 'Zucchine, peperoni, melanzane' },
      { name: 'Insalata', quantity: '2 cespi', category: 'Verdure', notes: '' },
      { name: 'Birra', quantity: '2 casse', category: 'Bevande', notes: '' },
      { name: 'Acqua', quantity: '6 bottiglie', category: 'Bevande', notes: '' },
      { name: 'Vino rosso', quantity: '2 bottiglie', category: 'Bevande', notes: '' },
    ],
    gearItems: [
      { name: 'Griglia', quantity: '1', notes: '' },
      { name: 'Carbonella', quantity: '2 sacchi', notes: '' },
      { name: 'Accendino / Diavolina', quantity: '', notes: '' },
      { name: 'Pinze', quantity: '2', notes: '' },
      { name: 'Piatti e posate', quantity: '~15 set', notes: '' },
      { name: 'Bicchieri', quantity: '~15', notes: '' },
      { name: 'Sacchi spazzatura', quantity: '1 rotolo', notes: '' },
      { name: 'Borsa frigo', quantity: '1', notes: '' },
    ],
    tasks: [
      { title: 'Comprare la carne', description: 'Dal macellaio', priority: 'important' },
      { title: 'Comprare carbonella', description: '', priority: 'important' },
      { title: 'Fare la spesa bevande', description: '', priority: 'normal' },
      { title: 'Organizzare le macchine', description: 'Chi guida? Quanti posti?', priority: 'normal' },
    ],
  },

  veg: {
    id: 'veg',
    label: 'Grigliata Veg',
    emoji: '🥗',
    description: 'Verdure, formaggi grigliati, hummus e tanta birra.',
    foodItems: [
      { name: 'Zucchine', quantity: '1 kg', category: 'Verdure', notes: '' },
      { name: 'Peperoni', quantity: '6', category: 'Verdure', notes: '' },
      { name: 'Melanzane', quantity: '3', category: 'Verdure', notes: '' },
      { name: 'Pannocchie', quantity: '8', category: 'Verdure', notes: '' },
      { name: 'Halloumi', quantity: '500g', category: 'Altro', notes: 'Formaggio da grigliare' },
      { name: 'Hummus', quantity: '2 vaschette', category: 'Condimenti', notes: '' },
      { name: 'Pane pita', quantity: '2 pacchi', category: 'Pane', notes: '' },
      { name: 'Birra', quantity: '2 casse', category: 'Bevande', notes: '' },
      { name: 'Acqua', quantity: '6 bottiglie', category: 'Bevande', notes: '' },
      { name: 'Succhi di frutta', quantity: '3', category: 'Bevande', notes: '' },
    ],
    gearItems: [
      { name: 'Griglia', quantity: '1', notes: '' },
      { name: 'Carbonella', quantity: '1 sacco', notes: '' },
      { name: 'Piatti e posate', quantity: '~12 set', notes: '' },
      { name: 'Coltelli e tagliere', quantity: '', notes: '' },
      { name: 'Sacchi spazzatura', quantity: '1 rotolo', notes: '' },
    ],
    tasks: [
      { title: 'Comprare le verdure', description: 'Zucchine, peperoni, melanzane, pannocchie', priority: 'important' },
      { title: 'Preparare hummus', description: 'O comprarlo pronto', priority: 'normal' },
    ],
  },

  taco: {
    id: 'taco',
    label: 'Taco Night',
    emoji: '🌮',
    description: 'Tortillas, carne macinata, salse e guacamole.',
    foodItems: [
      { name: 'Tortillas', quantity: '3 pacchi', category: 'Pane', notes: '' },
      { name: 'Carne macinata', quantity: '1.5 kg', category: 'Carne', notes: '' },
      { name: 'Pomodori', quantity: '6', category: 'Verdure', notes: 'Per la salsa' },
      { name: 'Cipolla rossa', quantity: '3', category: 'Verdure', notes: '' },
      { name: 'Avocado', quantity: '4', category: 'Verdure', notes: 'Per il guacamole' },
      { name: 'Lime', quantity: '4', category: 'Condimenti', notes: '' },
      { name: 'Panna acida', quantity: '1', category: 'Condimenti', notes: '' },
      { name: 'Formaggio grattugiato', quantity: '200g', category: 'Altro', notes: '' },
      { name: 'Birra messicana', quantity: '1 cassa', category: 'Bevande', notes: '' },
      { name: 'Nachos', quantity: '2 pacchi', category: 'Altro', notes: '' },
    ],
    gearItems: [
      { name: 'Padella grande', quantity: '1', notes: '' },
      { name: 'Ciotole per salse', quantity: '4-5', notes: '' },
      { name: 'Piatti', quantity: '~12', notes: '' },
      { name: 'Tovaglioli extra', quantity: '', notes: 'Servono tanti!' },
    ],
    tasks: [
      { title: 'Comprare tortillas e nachos', description: '', priority: 'important' },
      { title: 'Preparare guacamole', description: 'Avocado, lime, cipolla, sale', priority: 'normal' },
      { title: 'Preparare pico de gallo', description: 'Pomodori, cipolla, lime, coriandolo', priority: 'normal' },
    ],
  },

  pizza: {
    id: 'pizza',
    label: 'Pizza Party',
    emoji: '🍕',
    description: 'Impasti, condimenti vari e forno a legna.',
    foodItems: [
      { name: 'Impasto pizza', quantity: '2 kg', category: 'Pane', notes: 'O comprare pronto' },
      { name: 'Mozzarella', quantity: '1 kg', category: 'Altro', notes: '' },
      { name: 'Pomodoro pelato', quantity: '3 barattoli', category: 'Condimenti', notes: '' },
      { name: 'Prosciutto crudo', quantity: '200g', category: 'Carne', notes: '' },
      { name: 'Rucola', quantity: '1 busta', category: 'Verdure', notes: '' },
      { name: 'Funghi', quantity: '200g', category: 'Verdure', notes: '' },
      { name: 'Olive', quantity: '1 barattolo', category: 'Condimenti', notes: '' },
      { name: 'Birra', quantity: '2 casse', category: 'Bevande', notes: '' },
      { name: 'Coca-Cola', quantity: '3 bottiglie', category: 'Bevande', notes: '' },
    ],
    gearItems: [
      { name: 'Forno / pietra refrattaria', quantity: '1', notes: '' },
      { name: 'Mattarello', quantity: '1', notes: '' },
      { name: 'Teglie', quantity: '3-4', notes: '' },
      { name: 'Carta forno', quantity: '1 rotolo', notes: '' },
      { name: 'Piatti e bicchieri', quantity: '~12 set', notes: '' },
    ],
    tasks: [
      { title: 'Preparare impasto', description: 'La sera prima!', priority: 'important' },
      { title: 'Comprare mozzarella', description: 'Fresca, il giorno stesso', priority: 'important' },
      { title: 'Preparare salsa', description: 'Pelati, basilico, sale, olio', priority: 'normal' },
    ],
  },
};

export function getTemplate(id) {
  return templates[id] || null;
}

export function getTemplateList() {
  return Object.values(templates).map(t => ({
    id: t.id,
    label: t.label,
    emoji: t.emoji,
    description: t.description,
  }));
}

export default templates;
