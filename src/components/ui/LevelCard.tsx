import React from 'react';
import Link from 'next/link';
import { CheckIcon } from '@/components/ui/Icons';

export interface LevelCardProps {
  title: string;
  description: string;
  slug: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  isSelected?: boolean;
  onClick?: () => void;
}

export const LevelCard: React.FC<LevelCardProps> = ({
  title,
  description,
  slug,
  icon: Icon,
  isSelected = false,
  onClick,
}) => {
  const cardContent = (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between w-full">
        {/* Single-colour line icon in primary blue #1D4ED8 */}
        <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center transition-colors ${
          isSelected ? 'bg-blue-100 text-[#1D4ED8]' : 'bg-blue-50/80 text-[#1D4ED8] group-hover:bg-blue-100/70'
        }`}>
          <Icon className="w-5 h-5 text-[#1D4ED8]" />
        </div>

        {isSelected && (
          <span className="w-5 h-5 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center shrink-0">
            <CheckIcon className="w-3 h-3 text-white" />
          </span>
        )}
      </div>

      <div className="mt-auto">
        <h3 className={`text-lg font-bold transition-colors ${
          isSelected ? 'text-[#1D4ED8]' : 'text-[#0F172A] group-hover:text-[#1D4ED8]'
        }`}>
          {title}
        </h3>
        <p className="mt-1 text-base text-[#475569] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );

  const baseClasses = `group block text-left p-6 rounded-[12px] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
    isSelected
      ? 'bg-blue-50/30 border-2 border-[#1D4ED8] shadow-xs'
      : 'bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-sm'
  }`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isSelected}
        className={`${baseClasses} w-full cursor-pointer`}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <Link
      href={`/careers?level=${encodeURIComponent(slug)}`}
      className={baseClasses}
      aria-label={`Explore career roadmaps for ${title}`}
    >
      {cardContent}
    </Link>
  );
};
