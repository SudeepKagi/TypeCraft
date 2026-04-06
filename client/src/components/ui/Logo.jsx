import React from 'react';

export const Logo = ({ size = 32, className = "", color = "#1D9E75", showText = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_8px_rgba(29,158,117,0.3)]"
      >
        {/* Hexagon Outline */}
        <path 
          d="M50 5L89.5 27.5V72.5L50 95L10.5 72.5V27.5L50 5Z" 
          stroke={color} 
          strokeWidth="8" 
          strokeLinejoin="round"
        />
        
        {/* TC Monogram - Industrial Style */}
        <text 
          x="50%" 
          y="50%" 
          dominantBaseline="middle" 
          textAnchor="middle" 
          fill={color} 
          style={{ 
            fontFamily: 'Unbounded, sans-serif', 
            fontWeight: 900, 
            fontSize: '38px',
            letterSpacing: '-0.05em'
          }}
        >
          TC
        </text>
      </svg>
      
      {showText && (
        <span className="font-heading font-black text-white tracking-tighter uppercase leading-none" style={{ fontSize: size * 0.8 }}>
          TypeCraft
        </span>
      )}
    </div>
  );
};
