export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export type InkType = 'auto' | 'ballpoint_blue' | 'black' | 'white' | 'red';

export function parseColorToRgb(color: string): RGBColor {
  if (!color) return { r: 254, g: 240, b: 138 }; // Default Canary Yellow

  const rgbMatch = color.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (rgbMatch) {
    return {
      r: Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10))),
      g: Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10))),
      b: Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10))),
    };
  }

  let hex = color.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length === 6) {
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  return { r: 254, g: 240, b: 138 };
}

export function rgbToString(rgb: RGBColor): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

export function rgbToHex(rgb: RGBColor): string {
  const toHex = (c: number) => {
    const hex = Math.min(255, Math.max(0, c)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function adjustBrightness(rgb: RGBColor, factor: number): RGBColor {
  return {
    r: Math.round(Math.min(255, Math.max(0, rgb.r * factor))),
    g: Math.round(Math.min(255, Math.max(0, rgb.g * factor))),
    b: Math.round(Math.min(255, Math.max(0, rgb.b * factor))),
  };
}

// WCAG 2.1 Relative Luminance Calculation
export function getRelativeLuminance(rgb: RGBColor): number {
  const transform = (val: number) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transform(rgb.r) + 0.7152 * transform(rgb.g) + 0.0722 * transform(rgb.b);
}

// WCAG 2.1 Contrast Ratio Formula
export function getContrastRatio(rgb1: RGBColor, rgb2: RGBColor): number {
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface PaperStyle {
  baseRgb: string;
  hex: string;
  lightRgb: string;
  darkRgb: string;
  inkColor: string;
  borderRgb: string;
  isDarkNote: boolean;
  contrastRatio: number;
  wcagRating: 'AAA' | 'AA' | 'Pass';
}

export function getPostitPaperStyle(colorInput?: string, inkType: InkType = 'auto'): PaperStyle {
  const bgRgb = parseColorToRgb(colorInput || '#fef08a');
  const light = adjustBrightness(bgRgb, 1.05);
  const dark = adjustBrightness(bgRgb, 0.90);
  const border = adjustBrightness(bgRgb, 0.80);
  
  const bgLuminance = getRelativeLuminance(bgRgb);
  const isDarkNote = bgLuminance < 0.38;

  let chosenInkRgb: RGBColor;

  if (inkType === 'ballpoint_blue') {
    // If background is dark, use luminous light ice-blue to maintain readability!
    chosenInkRgb = isDarkNote ? { r: 147, g: 197, b: 253 } : { r: 26, g: 54, b: 160 };
  } else if (inkType === 'black') {
    chosenInkRgb = isDarkNote ? { r: 248, g: 250, b: 252 } : { r: 15, g: 23, b: 42 };
  } else if (inkType === 'white') {
    chosenInkRgb = isDarkNote ? { r: 255, g: 255, b: 255 } : { r: 30, g: 41, b: 59 };
  } else if (inkType === 'red') {
    chosenInkRgb = isDarkNote ? { r: 254, g: 202, b: 202 } : { r: 185, g: 28, b: 28 };
  } else {
    // 'auto' HCI optimal contrast:
    // If background is light, classic ballpoint blue (or charcoal); if dark, high-contrast crisp white!
    chosenInkRgb = isDarkNote ? { r: 255, g: 255, b: 255 } : { r: 26, g: 60, b: 180 };
  }

  const contrastRatio = parseFloat(getContrastRatio(bgRgb, chosenInkRgb).toFixed(2));
  const wcagRating = contrastRatio >= 7 ? 'AAA' : contrastRatio >= 4.5 ? 'AA' : 'Pass';

  return {
    baseRgb: rgbToString(bgRgb),
    hex: rgbToHex(bgRgb),
    lightRgb: rgbToString(light),
    darkRgb: rgbToString(dark),
    borderRgb: rgbToString(border),
    inkColor: rgbToString(chosenInkRgb),
    isDarkNote,
    contrastRatio,
    wcagRating,
  };
}
