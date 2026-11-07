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
    id: 'canary_yellow',
    name: 'Canary Yellow',
    colorHex: '#FFF380',
    rgb: 'rgb(255, 243, 128)',
    bgLight: '#FFF380',
    bgDark: '#2a2614',
    accent: '#d97706',
  },
  {
    id: 'sage_green',
    name: 'Sage Paper',
    colorHex: '#A8C3B2',
    rgb: 'rgb(168, 195, 178)',
    bgLight: '#A8C3B2',
    bgDark: '#1a2920',
    accent: '#2d6a4f',
  },
  {
    id: 'neon_coral',
    name: 'Neon Coral',
    colorHex: '#FF9AA2',
    rgb: 'rgb(255, 154, 162)',
    bgLight: '#FF9AA2',
    bgDark: '#33191b',
    accent: '#e11d48',
  },
  {
    id: 'mint_sage',
    name: 'Mint Sage',
    colorHex: '#B5EAD7',
    rgb: 'rgb(181, 234, 215)',
    bgLight: '#B5EAD7',
    bgDark: '#12251e',
    accent: '#059669',
  },
  {
    id: 'sky_blue',
    name: 'Sky Blue',
    colorHex: '#C7CEEA',
    rgb: 'rgb(199, 206, 234)',
    bgLight: '#C7CEEA',
    bgDark: '#181b2c',
    accent: '#3b82f6',
  },
  {
    id: 'kraft_brown',
    name: 'Kraft Brown',
    colorHex: '#E6CCB2',
    rgb: 'rgb(230, 204, 178)',
    bgLight: '#E6CCB2',
    bgDark: '#2b211a',
    accent: '#9a3412',
  },
  {
    id: 'charcoal_black',
    name: 'Charcoal Black',
    colorHex: '#2B2B2B',
    rgb: 'rgb(43, 43, 43)',
    bgLight: '#2B2B2B',
    bgDark: '#1a1a1a',
    accent: '#ffffff',
  },
  {
    id: 'yellow_legacy',
    name: 'Post-it Yellow',
    colorHex: '#fef08a',
    rgb: 'rgb(254, 240, 138)',
    bgLight: '#fef08a',
    bgDark: '#2a2614',
    accent: '#d97706',
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
