
import React from 'react';

interface PCCSLogoProps {
  className?: string;
  size?: number;
  src?: string;
}

const PCCSLogo: React.FC<PCCSLogoProps> = ({ className, size = 40, src }) => {
  if (src) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden rounded-xl ${className}`} style={{ width: size, height: size }}>
        <img src={src} className="w-full h-full object-contain" alt="Logo" />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        {/* Background Oval */}
        <ellipse cx="50" cy="50" rx="42" ry="38" fill="white" />

        {/* Blue Side Segments */}
        <path d="M 22 25 Q 10 50 22 75 L 35 75 Q 25 50 35 25 Z" fill="#4d79ff" />
        <path d="M 78 25 Q 90 50 78 75 L 65 75 Q 75 50 65 25 Z" fill="#4d79ff" />

        {/* Black Outer Arcs */}
        <path d="M 30 15 Q 5 50 30 85" stroke="black" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 70 15 Q 95 50 70 85" stroke="black" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* PCCS Text */}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#701d63"
          style={{
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '32px',
            fontWeight: '900',
            transform: 'scale(0.8, 1.4) translate(12px, -14px)'
          }}
        >
          PCCS
        </text>
      </svg>
    </div>
  );
};

export default PCCSLogo;
