import React from 'react';

export const MoroccanPattern = ({ 
  className = "opacity-10", 
  color = "white",
  scale = 1
}: { 
  className?: string;
  color?: string;
  scale?: number;
}) => (
  <div className={`absolute inset-0 ${className} pointer-events-none overflow-hidden`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern 
          id="moroccan-zellige" 
          x="0" 
          y="0" 
          width={60 * scale} 
          height={60 * scale} 
          patternUnits="userSpaceOnUse"
          patternTransform={`rotate(0)`}
        >
          {/* Motif inspiré du Zellige (étoile à 8 branches simplifiée) */}
          <path 
            d="M30 0 L37 23 L60 30 L37 37 L30 60 L23 37 L0 30 L23 23 Z" 
            fill="none" 
            stroke={color} 
            strokeWidth="1.5"
            transform={`scale(${scale})`}
          />
          <circle cx={30 * scale} cy={30 * scale} r={4 * scale} fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#moroccan-zellige)" />
    </svg>
  </div>
);

export const MoroccanArch = ({ className = "" }: { className?: string }) => (
  <div className={`absolute bottom-0 left-0 right-0 h-16 pointer-events-none ${className} opacity-20`}>
     <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
        <path fill="white" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,202.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
    </svg>
  </div>
);
