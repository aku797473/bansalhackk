import React from 'react';

export const RealisticSun = ({ size = 24, className = "" }) => (
  <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
    {/* Outer Glow */}
    <div className="absolute inset-0 bg-amber-400 rounded-full blur-md opacity-40 animate-pulse" />
    
    {/* Core */}
    <div className="relative w-full h-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)] border border-amber-200/30">
      {/* Surface Texture/Detail */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)] rounded-full" />
    </div>

    {/* Rays */}
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1/4 h-[2px] bg-gradient-to-r from-amber-400 to-transparent rounded-full opacity-60"
        style={{
          transform: `rotate(${i * 45}deg) translateX(${size * 0.4}px)`,
          transformOrigin: 'left center'
        }}
      />
    ))}
  </div>
);

export const RealisticCloud = ({ size = 24, className = "" }) => (
  <div className={`relative ${className}`} style={{ width: size, height: size }}>
    <div className="absolute bottom-[10%] left-[10%] w-[60%] h-[50%] bg-white rounded-full shadow-lg" />
    <div className="absolute top-[20%] right-[15%] w-[50%] h-[60%] bg-slate-50 rounded-full shadow-md" />
    <div className="absolute bottom-[15%] right-[10%] w-[45%] h-[45%] bg-slate-100 rounded-full" />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-200/20 to-transparent rounded-full blur-sm" />
  </div>
);
