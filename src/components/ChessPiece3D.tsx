import React from 'react';

export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

interface ChessPieceProps {
  type: PieceType;
  color: PieceColor;
  className?: string;
}

export const ChessPiece3D: React.FC<ChessPieceProps> = ({ type, color, className = '' }) => {
  const isWhite = color === 'w';
  const idPrefix = `piece-${color}-${type}`;

  // Palette definitions
  const whiteGradients = (
    <defs>
      {/* 3D Base Cylindrical Gradient */}
      <linearGradient id={`${idPrefix}-body`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#d9cfb8" />
        <stop offset="25%" stopColor="#fdfaf3" />
        <stop offset="60%" stopColor="#eae0ce" />
        <stop offset="90%" stopColor="#c5b699" />
        <stop offset="100%" stopColor="#9e8e72" />
      </linearGradient>

      {/* Radial Highlight */}
      <radialGradient id={`${idPrefix}-sphere`} cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor="#fdfaf0" />
        <stop offset="80%" stopColor="#dacbb2" />
        <stop offset="100%" stopColor="#a9987c" />
      </radialGradient>

      {/* Gold / Brass Accent for trims */}
      <linearGradient id={`${idPrefix}-accent`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fae7b9" />
        <stop offset="50%" stopColor="#d4af37" />
        <stop offset="100%" stopColor="#8c6d17" />
      </linearGradient>

      {/* 3D Drop Shadow */}
      <filter id={`${idPrefix}-shadow`} x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.45" />
      </filter>
    </defs>
  );

  const blackGradients = (
    <defs>
      {/* 3D Dark Ebony / Obsidian Gradient */}
      <linearGradient id={`${idPrefix}-body`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3d414a" />
        <stop offset="25%" stopColor="#555a64" />
        <stop offset="55%" stopColor="#25272c" />
        <stop offset="85%" stopColor="#17181c" />
        <stop offset="100%" stopColor="#0b0c0d" />
      </linearGradient>

      {/* Radial Dark Sphere Highlight */}
      <radialGradient id={`${idPrefix}-sphere`} cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#636975" />
        <stop offset="35%" stopColor="#373a42" />
        <stop offset="80%" stopColor="#1a1c21" />
        <stop offset="100%" stopColor="#0a0a0c" />
      </radialGradient>

      {/* Dark Silver / Platinum Accent */}
      <linearGradient id={`${idPrefix}-accent`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8d939e" />
        <stop offset="50%" stopColor="#50545c" />
        <stop offset="100%" stopColor="#23252a" />
      </linearGradient>

      {/* 3D Drop Shadow */}
      <filter id={`${idPrefix}-shadow`} x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
      </filter>
    </defs>
  );

  const strokeColor = isWhite ? '#8d7b5f' : '#141518';
  const strokeWidth = '1.2';
  const bodyFill = `url(#${idPrefix}-body)`;
  const sphereFill = `url(#${idPrefix}-sphere)`;
  const accentFill = `url(#${idPrefix}-accent)`;

  const renderPiece = () => {
    switch (type) {
      case 'p': // Pawn
        return (
          <g filter={`url(#${idPrefix}-shadow)`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round">
            {/* Base Plinth */}
            <ellipse cx="50" cy="85" rx="28" ry="8" fill={bodyFill} />
            <path d="M 23 83 C 23 77 77 77 77 83 L 72 73 C 72 71 28 71 28 73 Z" fill={bodyFill} />
            {/* Neck / Torso */}
            <path d="M 33 71 C 36 52 41 45 42 41 C 38 41 38 37 50 37 C 62 37 62 41 58 41 C 59 45 64 52 67 71 Z" fill={bodyFill} />
            {/* Collar Ring */}
            <ellipse cx="50" cy="38" rx="14" ry="4" fill={accentFill} />
            {/* Head Ball */}
            <circle cx="50" cy="24" r="14" fill={sphereFill} />
            {/* Specular Glint */}
            <ellipse cx="46" cy="19" rx="3.5" ry="2" fill="#ffffff" opacity={isWhite ? 0.75 : 0.35} stroke="none" />
          </g>
        );

      case 'r': // Rook
        return (
          <g filter={`url(#${idPrefix}-shadow)`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round">
            {/* Base Plinth */}
            <ellipse cx="50" cy="86" rx="31" ry="8" fill={bodyFill} />
            <path d="M 20 84 C 20 78 80 78 80 84 L 74 74 C 74 72 26 72 26 74 Z" fill={bodyFill} />
            {/* Tapered Tower */}
            <path d="M 28 73 L 33 36 L 67 36 L 72 73 Z" fill={bodyFill} />
            {/* Tower Band */}
            <path d="M 29 37 C 29 33 71 33 71 37 L 75 28 C 75 25 25 25 25 28 Z" fill={accentFill} />
            {/* Crenellated Top */}
            <path
              d="M 24 28 L 24 16 L 33 16 L 33 21 L 44 21 L 44 16 L 56 16 L 56 21 L 67 21 L 67 16 L 76 16 L 76 28 Z"
              fill={bodyFill}
            />
            {/* Slit detail */}
            <rect x="47" y="44" width="6" height="12" rx="3" fill={accentFill} opacity="0.8" />
            <ellipse cx="45" cy="18" rx="3" ry="1.5" fill="#ffffff" opacity={isWhite ? 0.6 : 0.25} stroke="none" />
          </g>
        );

      case 'n': // Knight
        return (
          <g filter={`url(#${idPrefix}-shadow)`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round">
            {/* Base */}
            <ellipse cx="50" cy="86" rx="31" ry="8" fill={bodyFill} />
            <path d="M 20 84 C 20 78 80 78 80 84 L 73 75 C 73 73 27 73 27 75 Z" fill={bodyFill} />
            {/* Sculpted Equestrian Body */}
            <path
              d="M 28 75 
                 C 28 65 31 56 25 50 
                 C 20 45 16 38 21 34 
                 C 25 31 32 37 35 34 
                 C 33 31 35 24 38 18 
                 C 40 14 43 14 46 17 
                 C 48 15 52 14 56 18 
                 C 62 23 66 31 74 41 
                 C 79 48 76 56 73 63 
                 C 71 69 72 72 73 75 Z"
              fill={bodyFill}
            />
            {/* Mane Tufts */}
            <path
              d="M 45 18 C 50 25 55 35 63 43 C 65 40 68 37 66 32 C 63 27 58 21 54 18 Z"
              fill={accentFill}
              opacity="0.9"
            />
            <path
              d="M 58 35 C 64 45 68 55 72 63 C 74 60 76 55 74 49 Z"
              fill={accentFill}
              opacity="0.8"
            />
            {/* Muzzle & Jaw */}
            <ellipse cx="25" cy="38" rx="4" ry="6" transform="rotate(-20 25 38)" fill={accentFill} />
            {/* Nostril */}
            <circle cx="23" cy="38" r="1.5" fill={strokeColor} />
            {/* Alert Eye */}
            <path d="M 33 28 Q 38 26 39 30 Q 35 31 33 28 Z" fill="#ffffff" stroke={strokeColor} strokeWidth="0.8" />
            <circle cx="36" cy="28.5" r="1.5" fill={isWhite ? '#2c251d' : '#ffffff'} stroke="none" />
            {/* Highlights */}
            <path d="M 40 21 Q 48 35 52 50" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity={isWhite ? 0.6 : 0.25} fill="none" />
          </g>
        );

      case 'b': // Bishop
        return (
          <g filter={`url(#${idPrefix}-shadow)`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round">
            {/* Base */}
            <ellipse cx="50" cy="86" rx="30" ry="8" fill={bodyFill} />
            <path d="M 21 84 C 21 78 79 78 79 84 L 73 74 C 73 72 27 72 27 74 Z" fill={bodyFill} />
            {/* Stem */}
            <path d="M 33 73 C 36 55 42 49 43 45 C 38 45 37 41 50 41 C 63 41 62 45 57 45 C 58 49 64 55 67 73 Z" fill={bodyFill} />
            {/* Collar */}
            <ellipse cx="50" cy="42" rx="16" ry="4" fill={accentFill} />
            {/* Slit Miter (Head) */}
            <path
              d="M 35 40 
                 C 32 30 35 21 50 16 
                 C 65 21 68 30 65 40 
                 C 60 44 40 44 35 40 Z"
              fill={sphereFill}
            />
            {/* Miter Diagonal Cut / Slash */}
            <path d="M 44 23 L 56 35" stroke={isWhite ? '#5c4831' : '#0b0c0d'} strokeWidth="2.5" strokeLinecap="round" />
            {/* Top Finial / Ball */}
            <circle cx="50" cy="13" r="4.5" fill={accentFill} />
            {/* Specular */}
            <ellipse cx="45" cy="24" rx="3" ry="6" fill="#ffffff" opacity={isWhite ? 0.65 : 0.25} stroke="none" transform="rotate(-15 45 24)" />
          </g>
        );

      case 'q': // Queen
        return (
          <g filter={`url(#${idPrefix}-shadow)`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round">
            {/* Base */}
            <ellipse cx="50" cy="87" rx="33" ry="8" fill={bodyFill} />
            <path d="M 18 85 C 18 79 82 79 82 85 L 75 75 C 75 73 25 73 25 75 Z" fill={bodyFill} />
            {/* Sculpted Waisted Torso */}
            <path d="M 31 74 C 36 56 42 45 42 41 C 36 41 36 37 50 37 C 64 37 64 41 58 41 C 58 45 64 56 69 74 Z" fill={bodyFill} />
            {/* Belt */}
            <ellipse cx="50" cy="38" rx="17" ry="4.5" fill={accentFill} />
            {/* Flared Coronet */}
            <path
              d="M 31 36 
                 L 22 18 L 34 25 L 50 14 L 66 25 L 78 18 L 69 36 Z"
              fill={bodyFill}
            />
            {/* Coronet Jewels / Pearls */}
            <circle cx="22" cy="17" r="3.5" fill={accentFill} />
            <circle cx="34" cy="24" r="3" fill={accentFill} />
            <circle cx="50" cy="13" r="4.5" fill={accentFill} />
            <circle cx="66" cy="24" r="3" fill={accentFill} />
            <circle cx="78" cy="17" r="3.5" fill={accentFill} />
            {/* Center Pearl Gown Flutes */}
            <path d="M 44 40 L 41 68 M 50 40 L 50 70 M 56 40 L 59 68" stroke={strokeColor} strokeWidth="1" opacity="0.6" />
            {/* Specular */}
            <ellipse cx="48" cy="46" rx="4" ry="10" fill="#ffffff" opacity={isWhite ? 0.6 : 0.25} stroke="none" />
          </g>
        );

      case 'k': // King
        return (
          <g filter={`url(#${idPrefix}-shadow)`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round">
            {/* Base */}
            <ellipse cx="50" cy="87" rx="34" ry="8" fill={bodyFill} />
            <path d="M 17 85 C 17 79 83 79 83 85 L 76 75 C 76 73 24 73 24 75 Z" fill={bodyFill} />
            {/* Robust Torso */}
            <path d="M 30 74 C 35 56 41 45 40 40 C 35 40 35 36 50 36 C 65 36 65 40 60 40 C 59 45 65 56 70 74 Z" fill={bodyFill} />
            {/* Crown Base Ring */}
            <ellipse cx="50" cy="37" rx="18" ry="4.5" fill={accentFill} />
            {/* Majestic Crown Dome */}
            <path
              d="M 30 36 
                 C 26 23 37 19 50 18 
                 C 63 19 74 23 70 36 Z"
              fill={sphereFill}
            />
            {/* Arches of Crown */}
            <path d="M 40 36 C 38 24 45 20 50 19 C 55 20 62 24 60 36" stroke={accentFill} strokeWidth="2.5" fill="none" />
            {/* Maltese Cross Finial */}
            <path
              d="M 48 5 L 52 5 L 52 9 L 56 7 L 56 11 L 52 11 L 52 18 L 48 18 L 48 11 L 44 11 L 44 7 L 48 9 Z"
              fill={accentFill}
            />
            {/* Specular Highlights */}
            <ellipse cx="47" cy="25" rx="4" ry="7" fill="#ffffff" opacity={isWhite ? 0.65 : 0.25} stroke="none" />
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`} style={{ width: '100%', height: '100%' }}>
      <svg
        viewBox="0 0 100 100"
        className="w-[86%] h-[86%] max-w-[80px] max-h-[80px] transition-transform duration-150 ease-out active:scale-95"
        style={{
          filter: 'drop-shadow(0 5px 6px rgba(0,0,0,0.45))',
          overflow: 'visible',
        }}
      >
        {isWhite ? whiteGradients : blackGradients}
        {renderPiece()}
      </svg>
    </div>
  );
};
