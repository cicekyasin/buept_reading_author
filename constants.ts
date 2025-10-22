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

export const CEFR_DESCRIPTIONS: Record<CEFRLevel, string> = {
  'A1': 'Can understand and use familiar everyday expressions and very basic phrases aimed at the satisfaction of needs of a concrete type.',
  'A1+': 'At the high end of A1. Can interact in a simple way provided the other person talks slowly and clearly.',
  'A2-': 'At the low end of A2. Can understand sentences and frequently used expressions related to areas of most immediate relevance.',
  'A2': 'Can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar and routine matters.',
  'A2+': 'At the high end of A2. Can describe in simple terms aspects of their background, immediate environment and matters in areas of immediate need.',
  'B1-': 'At the low end of B1. Starting to understand the main points of clear standard input on familiar matters.',
  'B1': 'Can deal with most situations likely to arise whilst travelling. Can produce simple connected text on topics which are familiar or of personal interest.',
  'B1+': 'At the high end of B1. Can describe experiences, dreams, and ambitions and briefly give reasons for opinions.',
  'B2-': 'At the low end of B2. Starting to understand the main ideas of complex text on both concrete and abstract topics.',
  'B2': 'Can interact with a degree of fluency that makes regular interaction with native speakers quite possible without strain for either party.',
  'B2+': 'At the high end of B2. Can produce clear, detailed text on a wide range of subjects and explain a viewpoint on a topical issue.',
};
