import React from 'react';

interface RedPushPinProps {
  color?: string; // default red '#e11d48' or '#dc2626'
  size?: number; // default 32
  className?: string;
}

export const RedPushPin: React.FC<RedPushPinProps> = ({
  color = '#dc2626',
  size = 34,
  className = '',
}) => {
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
        className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.35)]"
      >
        <defs>
          {/* Cast shadow under pinhead onto paper */}
          <radialGradient id="pinCastShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0, 0, 0, 0.45)" />
            <stop offset="60%" stopColor="rgba(0, 0, 0, 0.2)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>

          {/* 3D Spherical Head Gradient with Specular Highlight */}
          <radialGradient id="pinHeadShine" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ff9999" />
            <stop offset="25%" stopColor="#ef4444" />
            <stop offset="70%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </radialGradient>

          {/* Pin Waist / Collar Gradient */}
          <linearGradient id="pinCollarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#991b1b" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>

          {/* High-gloss Specular Dot */}
          <radialGradient id="specularDot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Realistic Cast Shadow on Paper */}
        <ellipse cx="20" cy="27" rx="11" ry="5.5" fill="url(#pinCastShadow)" />

        {/* 2. Pin Base Flange / Rim */}
        <ellipse cx="20" cy="22" rx="7.5" ry="3.5" fill="url(#pinCollarGrad)" />
        <ellipse cx="20" cy="21.5" rx="6.5" ry="2.8" fill="#7f1d1d" opacity="0.6" />

        {/* 3. Spherical 3D Pin Head */}
        <circle cx="20" cy="14" r="8.5" fill="url(#pinHeadShine)" />

        {/* 4. Glossy Specular Highlight (The round light reflection) */}
        <ellipse cx="17.5" cy="11" rx="3.2" ry="2" transform="rotate(-25 17.5 11)" fill="url(#specularDot)" />

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

