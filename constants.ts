import type { CEFRLevel } from './types';

export const CEFR_LEVELS: { main: 'A1' | 'A2' | 'B1' | 'B2'; sublevels: CEFRLevel[] }[] = [
  { main: 'A1', sublevels: ['A1', 'A1+'] },
  { main: 'A2', sublevels: ['A2-', 'A2', 'A2+'] },
  { main: 'B1', sublevels: ['B1-', 'B1', 'B1+'] },
  { main: 'B2', sublevels: ['B2-', 'B2', 'B2+'] },
];

export const QUICK_CEFR_SETS: { label: string; level: CEFRLevel }[] = [
  { label: 'A1-A2 Mix', level: 'A2-' },
  { label: 'A2-B1 Mix', level: 'B1-' },
  { label: 'B1-B2 Mix', level: 'B2-' },
];
