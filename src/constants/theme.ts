export interface StickyColorOption {
  id: string;
  name: string;
  colorHex: string;
  rgb: string;
  bgLight: string;
  bgDark: string;
  accent: string;
}

// Knovera Master Physical Creative Studio Palette
export const KNOVERA_PALETTE = {
  warmCream: '#F6EBDD',
  sand: '#D8C5A8',
  deepCharcoal: '#25231F',
  mutedBrown: '#695747',
  stickyYellow: '#F8D979',
  pastelGreen: '#C6DF9C',
  pastelPink: '#F1A6A6',
  lavender: '#D7B7EE',
  softBlue: '#A9C9E9',
} as const;

export const STICKY_COLORS: StickyColorOption[] = [
  {
    id: 'sticky_yellow',
    name: 'Sticky Yellow',
    colorHex: '#F8D979',
    rgb: 'rgb(248, 217, 121)',
    bgLight: '#F8D979',
    bgDark: '#2a2412',
    accent: '#d97706',
  },
  {
    id: 'pastel_green',
    name: 'Pastel Green',
    colorHex: '#C6DF9C',
    rgb: 'rgb(198, 223, 156)',
    bgLight: '#C6DF9C',
    bgDark: '#1a2914',
    accent: '#4d7c0f',
  },
  {
    id: 'pastel_pink',
    name: 'Pastel Pink',
    colorHex: '#F1A6A6',
    rgb: 'rgb(241, 166, 166)',
    bgLight: '#F1A6A6',
    bgDark: '#331a1a',
    accent: '#e11d48',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    colorHex: '#D7B7EE',
    rgb: 'rgb(215, 183, 238)',
    bgLight: '#D7B7EE',
    bgDark: '#241a2e',
    accent: '#7c3aed',
  },
  {
    id: 'soft_blue',
    name: 'Soft Blue',
    colorHex: '#A9C9E9',
    rgb: 'rgb(169, 201, 233)',
    bgLight: '#A9C9E9',
    bgDark: '#14202e',
    accent: '#2563eb',
  },
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
    colorHex: '#25231F',
    rgb: 'rgb(37, 35, 31)',
    bgLight: '#25231F',
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
    id: 'lavender_mist',
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
