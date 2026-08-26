export type LocaleCode = 'fr' | 'en';

export type EmojiCategoryId =
  | 'faces'
  | 'animals'
  | 'food'
  | 'objects'
  | 'symbols'
  | 'flags';

export type LocalizedText = Record<LocaleCode, string>;
export type LocalizedKeywords = Record<LocaleCode, string[]>;

export interface EmojiCategory {
  id: EmojiCategoryId;
  icon: string;
  label: LocalizedText;
}

export interface EmojiEntry {
  id: string;
  emoji: string;
  category: EmojiCategoryId;
  name: LocalizedText;
  keywords: LocalizedKeywords;
  codepoints: string[];
  supportsSkinTone: boolean;
  skinToneVariants?: string[];
}

export const emojiCategories: EmojiCategory[] = [
  {
    id: 'faces',
    icon: 'smile',
    label: { fr: 'Visages', en: 'Faces' },
  },
  {
    id: 'animals',
    icon: 'paw-print',
    label: { fr: 'Animaux', en: 'Animals' },
  },
  {
    id: 'food',
    icon: 'apple',
    label: { fr: 'Nourriture', en: 'Food' },
  },
  {
    id: 'objects',
    icon: 'briefcase',
    label: { fr: 'Objets', en: 'Objects' },
  },
  {
    id: 'symbols',
    icon: 'sparkles',
    label: { fr: 'Symboles', en: 'Symbols' },
  },
  {
    id: 'flags',
    icon: 'flag',
    label: { fr: 'Drapeaux', en: 'Flags' },
  },
];

export const sampleEmojis: EmojiEntry[] = [
  {
    id: 'grinning-face',
    emoji: '😀',
    category: 'faces',
    name: { fr: 'visage souriant', en: 'grinning face' },
    keywords: { fr: ['sourire', 'content', 'joie'], en: ['smile', 'happy', 'joy'] },
    codepoints: ['U+1F600'],
    supportsSkinTone: false,
  },
  {
    id: 'beaming-face',
    emoji: '😁',
    category: 'faces',
    name: { fr: 'visage rayonnant', en: 'beaming face' },
    keywords: { fr: ['sourire', 'dents', 'joie'], en: ['smile', 'teeth', 'happy'] },
    codepoints: ['U+1F601'],
    supportsSkinTone: false,
  },
  {
    id: 'face-with-tears-of-joy',
    emoji: '😂',
    category: 'faces',
    name: { fr: 'visage avec larmes de joie', en: 'face with tears of joy' },
    keywords: { fr: ['rire', 'larmes', 'drole'], en: ['laugh', 'tears', 'funny'] },
    codepoints: ['U+1F602'],
    supportsSkinTone: false,
  },
  {
    id: 'rolling-on-the-floor-laughing',
    emoji: '🤣',
    category: 'faces',
    name: { fr: 'mort de rire', en: 'rolling on the floor laughing' },
    keywords: { fr: ['rire', 'mdr', 'drole'], en: ['laugh', 'rofl', 'funny'] },
    codepoints: ['U+1F923'],
    supportsSkinTone: false,
  },
  {
    id: 'smiling-face-with-heart-eyes',
    emoji: '😍',
    category: 'faces',
    name: { fr: 'visage aux yeux en coeur', en: 'smiling face with heart-eyes' },
    keywords: { fr: ['amour', 'coeur', 'yeux'], en: ['love', 'heart', 'eyes'] },
    codepoints: ['U+1F60D'],
    supportsSkinTone: false,
  },
  {
    id: 'smiling-face-with-smiling-eyes',
    emoji: '😊',
    category: 'faces',
    name: { fr: 'visage souriant aux yeux rieurs', en: 'smiling face with smiling eyes' },
    keywords: { fr: ['sourire', 'content', 'doux'], en: ['smile', 'happy', 'warm'] },
    codepoints: ['U+1F60A'],
    supportsSkinTone: false,
  },
  {
    id: 'winking-face',
    emoji: '😉',
    category: 'faces',
    name: { fr: 'clin d oeil', en: 'winking face' },
    keywords: { fr: ['clin', 'oeil', 'complice'], en: ['wink', 'eye', 'playful'] },
    codepoints: ['U+1F609'],
    supportsSkinTone: false,
  },
  {
    id: 'smiling-face-with-sunglasses',
    emoji: '😎',
    category: 'faces',
    name: { fr: 'visage avec lunettes de soleil', en: 'smiling face with sunglasses' },
    keywords: { fr: ['cool', 'soleil', 'lunettes'], en: ['cool', 'sun', 'sunglasses'] },
    codepoints: ['U+1F60E'],
    supportsSkinTone: false,
  },
  {
    id: 'thinking-face',
    emoji: '🤔',
    category: 'faces',
    name: { fr: 'visage pensif', en: 'thinking face' },
    keywords: { fr: ['penser', 'question', 'reflexion'], en: ['think', 'question', 'wonder'] },
    codepoints: ['U+1F914'],
    supportsSkinTone: false,
  },
  {
    id: 'thumbs-up',
    emoji: '👍',
    category: 'symbols',
    name: { fr: 'pouce leve', en: 'thumbs up' },
    keywords: { fr: ['ok', 'oui', 'accord'], en: ['ok', 'yes', 'approve'] },
    codepoints: ['U+1F44D'],
    supportsSkinTone: true,
    skinToneVariants: ['👍🏻', '👍🏼', '👍🏽', '👍🏾', '👍🏿'],
  },
  {
    id: 'red-heart',
    emoji: '❤️',
    category: 'symbols',
    name: { fr: 'coeur rouge', en: 'red heart' },
    keywords: { fr: ['coeur', 'amour', 'aimer'], en: ['heart', 'love', 'like'] },
    codepoints: ['U+2764', 'U+FE0F'],
    supportsSkinTone: false,
  },
  {
    id: 'fire',
    emoji: '🔥',
    category: 'symbols',
    name: { fr: 'feu', en: 'fire' },
    keywords: { fr: ['feu', 'flamme', 'chaud'], en: ['fire', 'flame', 'hot'] },
    codepoints: ['U+1F525'],
    supportsSkinTone: false,
  },
  {
    id: 'party-popper',
    emoji: '🎉',
    category: 'objects',
    name: { fr: 'cotillons', en: 'party popper' },
    keywords: { fr: ['fete', 'celebration', 'bravo'], en: ['party', 'celebration', 'tada'] },
    codepoints: ['U+1F389'],
    supportsSkinTone: false,
  },
  {
    id: 'folded-hands',
    emoji: '🙏',
    category: 'symbols',
    name: { fr: 'mains jointes', en: 'folded hands' },
    keywords: { fr: ['merci', 'priere', 'svp'], en: ['thanks', 'pray', 'please'] },
    codepoints: ['U+1F64F'],
    supportsSkinTone: true,
    skinToneVariants: ['🙏🏻', '🙏🏼', '🙏🏽', '🙏🏾', '🙏🏿'],
  },
  {
    id: 'dog-face',
    emoji: '🐶',
    category: 'animals',
    name: { fr: 'tete de chien', en: 'dog face' },
    keywords: { fr: ['chien', 'animal', 'compagnon'], en: ['dog', 'animal', 'pet'] },
    codepoints: ['U+1F436'],
    supportsSkinTone: false,
  },
  {
    id: 'cat-face',
    emoji: '🐱',
    category: 'animals',
    name: { fr: 'tete de chat', en: 'cat face' },
    keywords: { fr: ['chat', 'animal', 'compagnon'], en: ['cat', 'animal', 'pet'] },
    codepoints: ['U+1F431'],
    supportsSkinTone: false,
  },
  {
    id: 'panda',
    emoji: '🐼',
    category: 'animals',
    name: { fr: 'panda', en: 'panda' },
    keywords: { fr: ['panda', 'animal', 'ours'], en: ['panda', 'animal', 'bear'] },
    codepoints: ['U+1F43C'],
    supportsSkinTone: false,
  },
  {
    id: 'pizza',
    emoji: '🍕',
    category: 'food',
    name: { fr: 'pizza', en: 'pizza' },
    keywords: { fr: ['pizza', 'nourriture', 'repas'], en: ['pizza', 'food', 'meal'] },
    codepoints: ['U+1F355'],
    supportsSkinTone: false,
  },
  {
    id: 'red-apple',
    emoji: '🍎',
    category: 'food',
    name: { fr: 'pomme rouge', en: 'red apple' },
    keywords: { fr: ['pomme', 'fruit', 'nourriture'], en: ['apple', 'fruit', 'food'] },
    codepoints: ['U+1F34E'],
    supportsSkinTone: false,
  },
  {
    id: 'hamburger',
    emoji: '🍔',
    category: 'food',
    name: { fr: 'hamburger', en: 'hamburger' },
    keywords: { fr: ['burger', 'nourriture', 'repas'], en: ['burger', 'food', 'meal'] },
    codepoints: ['U+1F354'],
    supportsSkinTone: false,
  },
  {
    id: 'briefcase',
    emoji: '💼',
    category: 'objects',
    name: { fr: 'mallette', en: 'briefcase' },
    keywords: { fr: ['travail', 'objet', 'bureau'], en: ['work', 'object', 'office'] },
    codepoints: ['U+1F4BC'],
    supportsSkinTone: false,
  },
  {
    id: 'light-bulb',
    emoji: '💡',
    category: 'objects',
    name: { fr: 'ampoule', en: 'light bulb' },
    keywords: { fr: ['idee', 'lumiere', 'objet'], en: ['idea', 'light', 'object'] },
    codepoints: ['U+1F4A1'],
    supportsSkinTone: false,
  },
  {
    id: 'mobile-phone',
    emoji: '📱',
    category: 'objects',
    name: { fr: 'telephone mobile', en: 'mobile phone' },
    keywords: { fr: ['telephone', 'mobile', 'objet'], en: ['phone', 'mobile', 'object'] },
    codepoints: ['U+1F4F1'],
    supportsSkinTone: false,
  },
  {
    id: 'sparkles',
    emoji: '✨',
    category: 'symbols',
    name: { fr: 'etincelles', en: 'sparkles' },
    keywords: { fr: ['briller', 'magie', 'etoile'], en: ['sparkle', 'magic', 'star'] },
    codepoints: ['U+2728'],
    supportsSkinTone: false,
  },
  {
    id: 'check-mark',
    emoji: '✅',
    category: 'symbols',
    name: { fr: 'coche blanche', en: 'check mark button' },
    keywords: { fr: ['ok', 'valide', 'coche'], en: ['ok', 'valid', 'check'] },
    codepoints: ['U+2705'],
    supportsSkinTone: false,
  },
  {
    id: 'rainbow',
    emoji: '🌈',
    category: 'symbols',
    name: { fr: 'arc-en-ciel', en: 'rainbow' },
    keywords: { fr: ['couleur', 'arc', 'ciel'], en: ['rainbow', 'color', 'sky'] },
    codepoints: ['U+1F308'],
    supportsSkinTone: false,
  },
  {
    id: 'flag-france',
    emoji: '🇫🇷',
    category: 'flags',
    name: { fr: 'drapeau france', en: 'flag France' },
    keywords: { fr: ['france', 'drapeau', 'fr'], en: ['france', 'flag', 'fr'] },
    codepoints: ['U+1F1EB', 'U+1F1F7'],
    supportsSkinTone: false,
  },
  {
    id: 'flag-united-states',
    emoji: '🇺🇸',
    category: 'flags',
    name: { fr: 'drapeau etats-unis', en: 'flag United States' },
    keywords: { fr: ['usa', 'etats-unis', 'drapeau'], en: ['usa', 'united states', 'flag'] },
    codepoints: ['U+1F1FA', 'U+1F1F8'],
    supportsSkinTone: false,
  },
];

export function getEmojiById(id: string): EmojiEntry | undefined {
  return sampleEmojis.find((entry) => entry.id === id);
}

export function getEmojisByCategory(category: EmojiCategoryId): EmojiEntry[] {
  return sampleEmojis.filter((entry) => entry.category === category);
}
