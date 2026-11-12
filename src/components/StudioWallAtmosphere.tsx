import React from 'react';

/** Decorative studio details are drawn in the DOM so the live workspace stays responsive. */
export const StudioWallAtmosphere: React.FC = () => (
  <div className="studio-wall-scene pointer-events-none absolute inset-0 z-0 select-none" aria-hidden="true">
    <svg className="studio-ivy" viewBox="0 0 300 900" preserveAspectRatio="xMinYMin meet" role="presentation">
      <path d="M-24 0 C35 92 80 128 67 247 S132 409 93 534 S133 694 72 900" />
      <path d="M10 63 C75 74 104 117 147 177 M61 214 C13 248 1 285 -13 328 M94 354 C157 367 189 410 221 465 M92 534 C33 571 12 610 -8 657" />
      {[
        [47, 91, -18], [76, 132, 25], [101, 180, -10], [52, 248, 30], [80, 302, -27],
        [132, 376, 18], [92, 426, -22], [62, 564, 28], [105, 622, -18], [70, 706, 22],
        [46, 790, -30], [91, 850, 16],
      ].map(([x, y, rotate], i) => (
        <ellipse key={i} cx={x} cy={y} rx="19" ry="38" transform={`rotate(${rotate} ${x} ${y})`} />
      ))}
    </svg>
    <div className="studio-desk" />
  </div>
);
