import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface HomeLevelCardProps {
  slug: string;
  title: string;
  description: string;
  imageSrc: string;
  altText: string;
}

export const HomeLevelCard: React.FC<HomeLevelCardProps> = ({
  slug,
  title,
  description,
  imageSrc,
  altText,
}) => {
  return (
    <Link
      href={`/careers?level=${encodeURIComponent(slug)}`}
      className="group block bg-white rounded-[12px] border border-[#E2E8F0] hover:border-ink transition-colors duration-200 overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink flex flex-col h-full shadow-xs"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Image
          src={imageSrc}
          alt={altText}
          fill
          className="object-cover group-hover:scale-103 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
        />
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="font-fraunces text-base sm:text-lg font-bold text-ink-900 group-hover:text-ink transition-colors leading-snug">
          {title}
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate leading-relaxed line-clamp-2">
          {description}
        </p>
        <div className="mt-auto pt-3 sm:pt-4 flex items-center gap-1 text-xs sm:text-sm font-semibold text-ink group-hover:gap-1.5 transition-all">
          <span>See options</span>
          <span aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
};
