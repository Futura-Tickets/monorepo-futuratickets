export type Country = {
  id: number;
  name: string;
  flag: string;
  code: string;
  cities: { value: string; label: string }[];
};

export const countries: Country[] = [
  {
    id: 1,
    name: 'Spain',
    flag: '🇪🇸',
    code: 'ES',
    cities: [
      { value: 'madrid', label: 'Madrid' },
      { value: 'barcelona', label: 'Barcelona' },
      { value: 'valencia', label: 'Valencia' },
      { value: 'sevilla', label: 'Sevilla' },
      { value: 'malaga', label: 'Málaga' },
      { value: 'bilbao', label: 'Bilbao' },
    ],
  },
  {
    id: 2,
    name: 'Luxembourg',
    flag: '🇱🇺',
    code: 'LU',
    cities: [
      { value: 'luxembourg-city', label: 'Luxembourg City' },
      { value: 'esch-sur-alzette', label: 'Esch-sur-Alzette' },
      { value: 'differdange', label: 'Differdange' },
      { value: 'dudelange', label: 'Dudelange' },
      { value: 'ettelbruck', label: 'Ettelbruck' },
    ],
  },
  {
    id: 3,
    name: 'France',
    flag: '🇫🇷',
    code: 'FR',
    cities: [
      { value: 'paris', label: 'Paris' },
      { value: 'marseille', label: 'Marseille' },
      { value: 'lyon', label: 'Lyon' },
      { value: 'toulouse', label: 'Toulouse' },
      { value: 'nice', label: 'Nice' },
      { value: 'bordeaux', label: 'Bordeaux' },
    ],
  },
  {
    id: 4,
    name: 'Germany',
    flag: '🇩🇪',
    code: 'DE',
    cities: [
      { value: 'berlin', label: 'Berlin' },
      { value: 'hamburg', label: 'Hamburg' },
      { value: 'munich', label: 'Munich' },
      { value: 'cologne', label: 'Cologne' },
      { value: 'frankfurt', label: 'Frankfurt' },
      { value: 'stuttgart', label: 'Stuttgart' },
    ],
  },
  {
    id: 5,
    name: 'Belgium',
    flag: '🇧🇪',
    code: 'BE',
    cities: [
      { value: 'brussels', label: 'Brussels' },
      { value: 'antwerp', label: 'Antwerp' },
      { value: 'ghent', label: 'Ghent' },
      { value: 'bruges', label: 'Bruges' },
      { value: 'liege', label: 'Liège' },
    ],
  },
  {
    id: 6,
    name: 'Netherlands',
    flag: '🇳🇱',
    code: 'NL',
    cities: [
      { value: 'amsterdam', label: 'Amsterdam' },
      { value: 'rotterdam', label: 'Rotterdam' },
      { value: 'the-hague', label: 'The Hague' },
      { value: 'utrecht', label: 'Utrecht' },
      { value: 'eindhoven', label: 'Eindhoven' },
    ],
  },
];

export const languages = [
  { id: 1, name: 'English', code: 'EN' },
  { id: 2, name: 'German', code: 'DE' },
  { id: 3, name: 'French', code: 'FR' },
  { id: 4, name: 'Spanish', code: 'ES' },
  { id: 5, name: 'Italian', code: 'IT' },
  { id: 6, name: 'Dutch', code: 'NL' },
  { id: 7, name: 'Japanese', code: 'JP' },
  { id: 8, name: 'Chinese', code: 'ZH' },
  { id: 9, name: 'Portuguese', code: 'PT' },
  { id: 10, name: 'Arabic', code: 'AR' },
];
