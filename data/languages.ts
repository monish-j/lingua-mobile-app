import { Language } from '@/types/learning';

export const languages: Language[] = [
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: 'https://flagcdn.com/w320/es.png',
    accentColor: '#FFC800', // Warning / Golden Yellow
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: 'https://flagcdn.com/w320/fr.png',
    accentColor: '#4D8BFF', // Lingua Blue
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: 'https://flagcdn.com/w320/jp.png',
    accentColor: '#FF4D4F', // Error / Crimson Red
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: 'https://flagcdn.com/w320/de.png',
    accentColor: '#FF8A00', // Streak / Orange
  },
];
