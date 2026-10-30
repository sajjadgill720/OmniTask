export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export function parseColorToRgb(color: string): RGBColor {
  if (!color) return { r: 254, g: 240, b: 138 }; // Default Canary Yellow

  // If already rgb(...)
  const rgbMatch = color.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (rgbMatch) {
    return {
      r: Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10))),
      g: Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10))),
      b: Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10))),
    };
  }

  // Hex (#fff or #ffffff)
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

export function getLuminance(rgb: RGBColor): number {
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

export interface PaperStyle {
  baseRgb: string;
  hex: string;
  lightRgb: string;
  darkRgb: string;
  inkColor: string;
  borderRgb: string;
  pinColor: string;
  isDarkNote: boolean;
}

export function getPostitPaperStyle(colorInput?: string, inkType: 'ballpoint_blue' | 'black' | 'auto' = 'ballpoint_blue'): PaperStyle {
  const rgb = parseColorToRgb(colorInput || '#fef08a');
  const light = adjustBrightness(rgb, 1.06);
  const dark = adjustBrightness(rgb, 0.88);
  const border = adjustBrightness(rgb, 0.82);
  const lum = getLuminance(rgb);
  const isDarkNote = lum < 0.45;

  let inkColor = '#1d4ed8'; // Classic ballpoint blue ink from the reference image!
  if (inkType === 'black') {
    inkColor = isDarkNote ? '#f8fafc' : '#1e293b';
  } else if (inkType === 'ballpoint_blue') {
    inkColor = isDarkNote ? '#93c5fd' : '#1e40af';
  } else {
    inkColor = isDarkNote ? '#ffffff' : '#1e3a8a';
  }

  // 3D Pushpin Color (default classic red like reference photo, or contrasting)
  const pinColor = '#dc2626';

  return {
    baseRgb: rgbToString(rgb),
    hex: rgbToHex(rgb),
    lightRgb: rgbToString(light),
    darkRgb: rgbToString(dark),
    borderRgb: rgbToString(border),
    inkColor,
    pinColor,
    isDarkNote,
  };
}

