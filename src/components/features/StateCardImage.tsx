'use client';

import React, { useState } from 'react';
import { getStateConfig } from '@/lib/stateConfig';
import { MapPinIcon } from '@/components/ui/Icons';

interface StateCardImageProps {
  stateName: string;
  className?: string;
}

export const StateCardImage: React.FC<StateCardImageProps> = ({
  stateName,
  className = 'h-24 w-full relative overflow-hidden',
}) => {
  const [hasError, setHasError] = useState(false);
  const config = getStateConfig(stateName);

  if (hasError || !config.imagePath) {
    return (
      <div
        className={`${className} bg-gradient-to-br ${config.accentGradient} flex flex-col items-center justify-center p-2 text-white text-center select-none`}
      >
        <MapPinIcon className="w-6 h-6 mb-1 text-white/90 drop-shadow-sm" />
        <span className="text-[11px] font-extrabold uppercase tracking-wider opacity-90 truncate max-w-[90%] drop-shadow-sm">
          {config.name}
        </span>
      </div>
    );
  }

  return (
    <div className={`${className} bg-slate-100`}>
      <img
        src={config.imagePath}
        alt={config.name}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
};
