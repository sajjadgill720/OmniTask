export interface StickyColorOption {
  id: string;
  name: string;
  colorHex: string;
  rgb: string;
  bgLight: string;
  bgDark: string;
  accent: string;
}

export const STICKY_COLORS: StickyColorOption[] = [
  {
    id: 'yellow',
    name: 'Canary Yellow',
    colorHex: '#fef08a',
    rgb: 'rgb(254, 240, 138)',
    bgLight: '#fef08a',
    bgDark: '#2a2614',
    accent: '#d97706',
  },
  {
    id: 'buttercup',
    name: 'Warm Butter',
    colorHex: '#fde047',
    rgb: 'rgb(253, 224, 71)',
    bgLight: '#fde047',
    bgDark: '#2c2510',
    accent: '#b45309',
  },
  {
    id: 'mint',
    name: 'Soft Mint',
    colorHex: '#bbf7d0',
    rgb: 'rgb(187, 247, 208)',
    bgLight: '#bbf7d0',
    bgDark: '#12251a',
    accent: '#059669',
  },
  {
    id: 'peach',
    name: 'Warm Peach',
    colorHex: '#fed7aa',
    rgb: 'rgb(254, 215, 170)',
    bgLight: '#fed7aa',
    bgDark: '#281a13',
    accent: '#ea580c',
  },
  {
    id: 'sky',
    name: 'Sky Blue',
    colorHex: '#bae6fd',
    rgb: 'rgb(186, 230, 253)',
    bgLight: '#bae6fd',
    bgDark: '#12212d',
    accent: '#0284c7',
  },
  {
    id: 'lavender',
    name: 'Lavender Mist',
    colorHex: '#e9d5ff',
    rgb: 'rgb(233, 213, 255)',
    bgLight: '#e9d5ff',
    bgDark: '#22162e',
    accent: '#9333ea',
  },
  {
    id: 'rose',
    name: 'Blush Rose',
    colorHex: '#fbcfe8',
    rgb: 'rgb(251, 207, 232)',
    bgLight: '#fbcfe8',
    bgDark: '#2b1624',
    accent: '#db2777',
  },
  {
    id: 'coral',
    name: 'Coral Pink',
    colorHex: '#fecaca',
    rgb: 'rgb(254, 202, 202)',
    bgLight: '#fecaca',
    bgDark: '#2d1818',
    accent: '#dc2626',
  },
  {
    id: 'white',
    name: 'Classic White',
    colorHex: '#ffffff',
    rgb: 'rgb(255, 255, 255)',
    bgLight: '#ffffff',
    bgDark: '#1b1d26',
    accent: '#64748b',
  },
];

export function getStickyColor(colorInput?: string): StickyColorOption {
  if (!colorInput) return STICKY_COLORS[0];
  const found = STICKY_COLORS.find(
    c => c.colorHex.toLowerCase() === colorInput.toLowerCase() || c.rgb.toLowerCase() === colorInput.toLowerCase()
  );
  if (found) return found;

  // Custom user RGB/Hex
  return {
    id: 'custom',
    name: 'Custom RGB',
    colorHex: colorInput,
    rgb: colorInput.startsWith('rgb') ? colorInput : colorInput,
    bgLight: colorInput,
    bgDark: '#1b1d26',
    accent: '#3b82f6',
  };
}
