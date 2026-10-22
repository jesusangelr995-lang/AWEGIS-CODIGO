import React from 'react';

interface AegisLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AegisLogo: React.FC<AegisLogoProps> = ({ className = '', size = 'md' }) => {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 34;

  return (
    <div className={`flex items-center gap-2.5 cursor-pointer select-none group ${className}`}>
      {/* Hexagonal Shield Crest */}
      <div 
        className="relative flex items-center justify-center rounded-full bg-white p-1 shadow-sm transition-transform duration-300 group-hover:scale-105"
        style={{ width: iconSize + 6, height: iconSize + 6 }}
      >
        <svg 
          viewBox="0 0 100 115" 
          className="w-full h-full drop-shadow-sm" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shield Outline */}
          <path 
            d="M50 4L94 22V58C94 85 75 106 50 112C25 106 6 85 6 58V22L50 4Z" 
            fill="#031733" 
            stroke="#009fe3" 
            strokeWidth="4"
          />
          {/* Inner Accent Ring & Core */}
          <path 
            d="M50 16L82 30V56C82 77 68 94 50 99C32 94 18 77 18 56V30L50 16Z" 
            stroke="#ffffff" 
            strokeWidth="2.5" 
            strokeDasharray="4 2"
            opacity="0.8"
          />
          {/* Aegis Lock / Shield Core */}
          <circle cx="50" cy="52" r="14" fill="#009fe3" />
          <path 
            d="M44 52C44 48.7 46.7 46 50 46C53.3 46 56 48.7 56 52V55H44V52Z" 
            stroke="#ffffff" 
            strokeWidth="2.5" 
            strokeLinecap="round"
          />
          <rect x="42" y="55" width="16" height="12" rx="2" fill="#ffffff" />
          <circle cx="50" cy="61" r="2" fill="#031733" />
          {/* AEGIS mini text inside shield */}
          <text 
            x="50" 
            y="82" 
            textAnchor="middle" 
            fill="#ffffff" 
            fontSize="9" 
            fontWeight="bold" 
            letterSpacing="1"
            fontFamily="sans-serif"
          >
            AEGIS
          </text>
        </svg>
      </div>

      <span className="text-xl md:text-2xl font-black tracking-wider text-white uppercase font-sans">
        AEGIS
      </span>
    </div>
  );
};
