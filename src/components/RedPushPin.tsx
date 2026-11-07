import React from 'react';

export type PinColor = 'red' | 'blue' | 'cyan' | 'purple' | 'yellow' | 'green';

interface RedPushPinProps {
  color?: PinColor | string; // 'red' | 'blue' | 'cyan' | 'purple' | 'yellow' | 'green'
  size?: number; // default 34
  className?: string;
}

const PIN_PALETTES: Record<PinColor, { highlight: string; base: string; dark: string; deep: string }> = {
  red: { highlight: '#ff9999', base: '#ef4444', dark: '#b91c1c', deep: '#7f1d1d' },
  blue: { highlight: '#93c5fd', base: '#3b82f6', dark: '#1d4ed8', deep: '#1e3a8a' },
  cyan: { highlight: '#67e8f9', base: '#06b6d4', dark: '#0891b2', deep: '#164e63' },
  purple: { highlight: '#d8b4fe', base: '#a855f7', dark: '#7e22ce', deep: '#581c87' },
  yellow: { highlight: '#fef08a', base: '#eab308', dark: '#ca8a04', deep: '#713f12' },
  green: { highlight: '#86efac', base: '#22c55e', dark: '#15803d', deep: '#14532d' },
};

export const RedPushPin: React.FC<RedPushPinProps> = ({
  color = 'red',
  size = 34,
  className = '',
}) => {
  const normalizedColor: PinColor = (color in PIN_PALETTES ? color : 'red') as PinColor;
  const palette = PIN_PALETTES[normalizedColor] || PIN_PALETTES.red;
  const idPrefix = `pin_${normalizedColor}_${size}`;

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_4px_5px_rgba(0,0,0,0.38)]"
      >
        <defs>
          {/* Cast shadow under pinhead onto paper */}
          <radialGradient id={`${idPrefix}_shadow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0, 0, 0, 0.5)" />
            <stop offset="60%" stopColor="rgba(0, 0, 0, 0.22)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>

          {/* 3D Spherical Head Gradient with Specular Highlight */}
          <radialGradient id={`${idPrefix}_head`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor={palette.highlight} />
            <stop offset="25%" stopColor={palette.base} />
            <stop offset="70%" stopColor={palette.dark} />
            <stop offset="100%" stopColor={palette.deep} />
          </radialGradient>

          {/* Pin Waist / Collar Gradient */}
          <linearGradient id={`${idPrefix}_collar`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={palette.dark} />
            <stop offset="50%" stopColor={palette.base} />
            <stop offset="100%" stopColor={palette.deep} />
          </linearGradient>

          {/* High-gloss Specular Dot */}
          <radialGradient id={`${idPrefix}_dot`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Realistic Cast Shadow on Paper */}
        <ellipse cx="20" cy="27" rx="11" ry="5.5" fill={`url(#${idPrefix}_shadow)`} />

        {/* 2. Pin Base Flange / Rim */}
        <ellipse cx="20" cy="22" rx="7.5" ry="3.5" fill={`url(#${idPrefix}_collar)`} />
        <ellipse cx="20" cy="21.5" rx="6.5" ry="2.8" fill={palette.deep} opacity="0.6" />

        {/* 3. Spherical 3D Pin Head */}
        <circle cx="20" cy="14" r="8.5" fill={`url(#${idPrefix}_head)`} />

        {/* 4. Glossy Specular Highlight (The round light reflection) */}
        <ellipse cx="17.5" cy="11" rx="3.2" ry="2" transform="rotate(-25 17.5 11)" fill={`url(#${idPrefix}_dot)`} />

        {/* 5. Rim reflection highlight on bottom-right */}
        <path
          d="M 23 18 C 25 17 26 15 25.5 13"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};
