import type { EmojiCategoryId } from '../data/emojis';
import type { LocaleCode } from './language';
import type { SkinTonePreference } from '../storage/skinTone';

export interface Messages {
  categories: Record<EmojiCategoryId, string>;
  categoriesLabel: string;
  mobileCategoriesLabel: string;
  collectionsLabel: string;
  recents: string;
  favorites: string;
  preferences: string;
  theme: string;
  language: string;
  skinTone: string;
  chooseTheme: string;
  chooseLanguage: string;
  chooseSkinTone: string;
  skinToneNames: Record<SkinTonePreference, string>;
  variantsFor: (name: string) => string;
  copyVariant: (name: string, tone: string) => string;
  system: string;
  light: string;
  dark: string;
  searchPlaceholder: string;
  searchHeading: string;
  searchResults: (count: number, query: string) => string;
  resultsLabel: (query: string) => string;
  noResults: (query: string) => string;
  copy: (name: string) => string;
  addFavorite: (name: string) => string;
  removeFavorite: (name: string) => string;
  copied: string;
  copyFailed: string;
  openMenu: string;
  closeMenu: string;
  home: string;
  loading: string;
  loadFailed: string;
  retry: string;
}

const categoryLabels: Record<LocaleCode, Record<EmojiCategoryId, string>> = {
  fr: { faces: 'Smileys', people: 'Personnes', animals: 'Animaux', food: 'Nourriture', activities: 'Activités', travel: 'Voyages', objects: 'Objets', symbols: 'Symboles', flags: 'Drapeaux' },
  en: { faces: 'Smileys', people: 'People', animals: 'Animals', food: 'Food', activities: 'Activities', travel: 'Travel', objects: 'Objects', symbols: 'Symbols', flags: 'Flags' },
  de: { faces: 'Smileys', people: 'Personen', animals: 'Tiere', food: 'Essen', activities: 'Aktivitäten', travel: 'Reisen', objects: 'Objekte', symbols: 'Symbole', flags: 'Flaggen' },
  it: { faces: 'Faccine', people: 'Persone', animals: 'Animali', food: 'Cibo', activities: 'Attività', travel: 'Viaggi', objects: 'Oggetti', symbols: 'Simboli', flags: 'Bandiere' },
  es: { faces: 'Emoticonos', people: 'Personas', animals: 'Animales', food: 'Comida', activities: 'Actividades', travel: 'Viajes', objects: 'Objetos', symbols: 'Símbolos', flags: 'Banderas' },
  pt: { faces: 'Smileys', people: 'Pessoas', animals: 'Animais', food: 'Comida', activities: 'Atividades', travel: 'Viagens', objects: 'Objetos', symbols: 'Símbolos', flags: 'Bandeiras' },
};

const skinToneMessages: Record<
  LocaleCode,
  {
    label: string;
    choose: string;
    names: Record<SkinTonePreference, string>;
    variantsFor: string;
    copyVariant: string;
  }
> = {
  fr: { label: 'Peau', choose: 'Choisir la teinte de peau', names: { neutral: 'Neutre', light: 'Claire', 'medium-light': 'Moyennement claire', medium: 'Moyenne', 'medium-dark': 'Moyennement foncée', dark: 'Foncée' }, variantsFor: 'Variantes de', copyVariant: 'Copier' },
  en: { label: 'Skin', choose: 'Choose skin tone', names: { neutral: 'Neutral', light: 'Light', 'medium-light': 'Medium-light', medium: 'Medium', 'medium-dark': 'Medium-dark', dark: 'Dark' }, variantsFor: 'Variants for', copyVariant: 'Copy' },
  de: { label: 'Haut', choose: 'Hautton auswählen', names: { neutral: 'Neutral', light: 'Hell', 'medium-light': 'Mittelhell', medium: 'Mittel', 'medium-dark': 'Mitteldunkel', dark: 'Dunkel' }, variantsFor: 'Varianten für', copyVariant: 'Kopieren' },
  it: { label: 'Pelle', choose: 'Scegli la tonalità della pelle', names: { neutral: 'Neutra', light: 'Chiara', 'medium-light': 'Medio-chiara', medium: 'Media', 'medium-dark': 'Medio-scura', dark: 'Scura' }, variantsFor: 'Varianti di', copyVariant: 'Copia' },
  es: { label: 'Piel', choose: 'Elegir tono de piel', names: { neutral: 'Neutro', light: 'Claro', 'medium-light': 'Claro medio', medium: 'Medio', 'medium-dark': 'Oscuro medio', dark: 'Oscuro' }, variantsFor: 'Variantes de', copyVariant: 'Copiar' },
  pt: { label: 'Pele', choose: 'Escolher tom de pele', names: { neutral: 'Neutro', light: 'Claro', 'medium-light': 'Médio-claro', medium: 'Médio', 'medium-dark': 'Médio-escuro', dark: 'Escuro' }, variantsFor: 'Variantes de', copyVariant: 'Copiar' },
};

const statusMessages: Record<LocaleCode, Pick<Messages, 'loading' | 'loadFailed' | 'retry'>> = {
  fr: { loading: 'Chargement des emojis…', loadFailed: 'Impossible de charger les emojis.', retry: 'Réessayer' },
  en: { loading: 'Loading emojis…', loadFailed: 'Unable to load emojis.', retry: 'Retry' },
  de: { loading: 'Emojis werden geladen…', loadFailed: 'Emojis konnten nicht geladen werden.', retry: 'Erneut versuchen' },
  it: { loading: 'Caricamento emoji…', loadFailed: 'Impossibile caricare gli emoji.', retry: 'Riprova' },
  es: { loading: 'Cargando emojis…', loadFailed: 'No se pudieron cargar los emojis.', retry: 'Reintentar' },
  pt: { loading: 'Carregando emojis…', loadFailed: 'Não foi possível carregar os emojis.', retry: 'Tentar novamente' },
};

export const messages: Record<LocaleCode, Messages> = {
  fr: createMessages('fr', {
    categoriesLabel: 'Catégories', mobileCategoriesLabel: 'Catégories emoji', collectionsLabel: 'Collections', recents: 'Récents', favorites: 'Favoris', preferences: 'Préférences', theme: 'Thème', language: 'Langue', chooseTheme: 'Choisir le thème', chooseLanguage: 'Choisir la langue', system: 'Système', light: 'Clair', dark: 'Sombre', searchPlaceholder: 'Rechercher un emoji', searchHeading: 'Recherche', result: 'résultat', results: 'résultats', forWord: 'pour', noResultsPrefix: 'Aucun emoji trouvé pour', copyPrefix: 'Copier', addFavoritePrefix: 'Ajouter aux favoris', removeFavoritePrefix: 'Retirer des favoris', copied: 'Copié !', copyFailed: 'Copie impossible', openMenu: 'Ouvrir le menu', closeMenu: 'Fermer le menu', home: 'Accueil EmojiDeck',
  }),
  en: createMessages('en', {
    categoriesLabel: 'Categories', mobileCategoriesLabel: 'Emoji categories', collectionsLabel: 'Collections', recents: 'Recents', favorites: 'Favorites', preferences: 'Preferences', theme: 'Theme', language: 'Language', chooseTheme: 'Choose theme', chooseLanguage: 'Choose language', system: 'System', light: 'Light', dark: 'Dark', searchPlaceholder: 'Search for an emoji', searchHeading: 'Search', result: 'result', results: 'results', forWord: 'for', noResultsPrefix: 'No emoji found for', copyPrefix: 'Copy', addFavoritePrefix: 'Add to favorites', removeFavoritePrefix: 'Remove from favorites', copied: 'Copied!', copyFailed: 'Unable to copy', openMenu: 'Open menu', closeMenu: 'Close menu', home: 'EmojiDeck home',
  }),
  de: createMessages('de', {
    categoriesLabel: 'Kategorien', mobileCategoriesLabel: 'Emoji-Kategorien', collectionsLabel: 'Sammlungen', recents: 'Zuletzt', favorites: 'Favoriten', preferences: 'Einstellungen', theme: 'Design', language: 'Sprache', chooseTheme: 'Design auswählen', chooseLanguage: 'Sprache auswählen', system: 'System', light: 'Hell', dark: 'Dunkel', searchPlaceholder: 'Emoji suchen', searchHeading: 'Suche', result: 'Ergebnis', results: 'Ergebnisse', forWord: 'für', noResultsPrefix: 'Kein Emoji gefunden für', copyPrefix: 'Kopieren', addFavoritePrefix: 'Zu Favoriten hinzufügen', removeFavoritePrefix: 'Aus Favoriten entfernen', copied: 'Kopiert!', copyFailed: 'Kopieren nicht möglich', openMenu: 'Menü öffnen', closeMenu: 'Menü schließen', home: 'EmojiDeck Startseite',
  }),
  it: createMessages('it', {
    categoriesLabel: 'Categorie', mobileCategoriesLabel: 'Categorie emoji', collectionsLabel: 'Raccolte', recents: 'Recenti', favorites: 'Preferiti', preferences: 'Preferenze', theme: 'Tema', language: 'Lingua', chooseTheme: 'Scegli il tema', chooseLanguage: 'Scegli la lingua', system: 'Sistema', light: 'Chiaro', dark: 'Scuro', searchPlaceholder: 'Cerca un emoji', searchHeading: 'Ricerca', result: 'risultato', results: 'risultati', forWord: 'per', noResultsPrefix: 'Nessun emoji trovato per', copyPrefix: 'Copia', addFavoritePrefix: 'Aggiungi ai preferiti', removeFavoritePrefix: 'Rimuovi dai preferiti', copied: 'Copiato!', copyFailed: 'Impossibile copiare', openMenu: 'Apri menu', closeMenu: 'Chiudi menu', home: 'Home EmojiDeck',
  }),
  es: createMessages('es', {
    categoriesLabel: 'Categorías', mobileCategoriesLabel: 'Categorías de emoji', collectionsLabel: 'Colecciones', recents: 'Recientes', favorites: 'Favoritos', preferences: 'Preferencias', theme: 'Tema', language: 'Idioma', chooseTheme: 'Elegir tema', chooseLanguage: 'Elegir idioma', system: 'Sistema', light: 'Claro', dark: 'Oscuro', searchPlaceholder: 'Buscar un emoji', searchHeading: 'Búsqueda', result: 'resultado', results: 'resultados', forWord: 'para', noResultsPrefix: 'No se encontró ningún emoji para', copyPrefix: 'Copiar', addFavoritePrefix: 'Añadir a favoritos', removeFavoritePrefix: 'Quitar de favoritos', copied: '¡Copiado!', copyFailed: 'No se pudo copiar', openMenu: 'Abrir menú', closeMenu: 'Cerrar menú', home: 'Inicio de EmojiDeck',
  }),
  pt: createMessages('pt', {
    categoriesLabel: 'Categorias', mobileCategoriesLabel: 'Categorias de emoji', collectionsLabel: 'Coleções', recents: 'Recentes', favorites: 'Favoritos', preferences: 'Preferências', theme: 'Tema', language: 'Idioma', chooseTheme: 'Escolher tema', chooseLanguage: 'Escolher idioma', system: 'Sistema', light: 'Claro', dark: 'Escuro', searchPlaceholder: 'Pesquisar um emoji', searchHeading: 'Pesquisa', result: 'resultado', results: 'resultados', forWord: 'para', noResultsPrefix: 'Nenhum emoji encontrado para', copyPrefix: 'Copiar', addFavoritePrefix: 'Adicionar aos favoritos', removeFavoritePrefix: 'Remover dos favoritos', copied: 'Copiado!', copyFailed: 'Não foi possível copiar', openMenu: 'Abrir menu', closeMenu: 'Fechar menu', home: 'Início do EmojiDeck',
  }),
};

interface MessageParts extends Omit<Messages, 'categories' | 'skinTone' | 'chooseSkinTone' | 'skinToneNames' | 'variantsFor' | 'copyVariant' | 'loading' | 'loadFailed' | 'retry' | 'searchResults' | 'resultsLabel' | 'noResults' | 'copy' | 'addFavorite' | 'removeFavorite'> {
  result: string;
  results: string;
  forWord: string;
  noResultsPrefix: string;
  copyPrefix: string;
  addFavoritePrefix: string;
  removeFavoritePrefix: string;
}

function createMessages(locale: LocaleCode, parts: MessageParts): Messages {
  const colon = locale === 'fr' ? ' :' : ':';
  const skinTone = skinToneMessages[locale];

  return {
    ...parts,
    ...statusMessages[locale],
    categories: categoryLabels[locale],
    skinTone: skinTone.label,
    chooseSkinTone: skinTone.choose,
    skinToneNames: skinTone.names,
    variantsFor: (name) => `${skinTone.variantsFor} ${name}`,
    copyVariant: (name, tone) => `${skinTone.copyVariant}${colon} ${name}, ${tone}`,
    searchResults: (count, query) => `${count} ${count === 1 ? parts.result : parts.results} ${parts.forWord} "${query}"`,
    resultsLabel: (query) => `${parts.searchHeading}: ${query}`,
    noResults: (query) => `${parts.noResultsPrefix} "${query}"`,
    copy: (name) => `${parts.copyPrefix}${colon} ${name}`,
    addFavorite: (name) => `${parts.addFavoritePrefix}${colon} ${name}`,
    removeFavorite: (name) => `${parts.removeFavoritePrefix}${colon} ${name}`,
  };
}
