import React from 'react';
import Link from 'next/link';

export interface LevelCardProps {
  title: string;
  description: string;
  slug: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

export const LevelCard: React.FC<LevelCardProps> = ({
  title,
  description,
  slug,
  icon: Icon,
}) => {
  return (
    <Link
      href={`/careers?level=${encodeURIComponent(slug)}`}
      className="group block p-6 bg-white rounded-[12px] border border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] transition-all duration-150"
      aria-label={`Explore career roadmaps for ${title}`}
    >
      <div className="flex flex-col gap-3">
        {/* Single-colour line icon in primary blue #1D4ED8 */}
        <div className="w-10 h-10 rounded-[8px] bg-blue-50/80 flex items-center justify-center text-[#1D4ED8] group-hover:bg-blue-100/70 transition-colors">
          <Icon className="w-5 h-5 text-[#1D4ED8]" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#1D4ED8] transition-colors">
            {title}
          </h3>
          <p className="mt-1 text-base text-[#475569] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
};
