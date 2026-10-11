'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { StudentProfile, StudentLevel, StudentStream, JourneyResolution } from '@/types/studentProfile';
import { getJourneyResolution, searchParamsToProfile, profileToSearchParams } from '@/lib/journey/journeyEngine';

const STORAGE_KEY = 'eduselect_student_profile';

const DEFAULT_PROFILE: StudentProfile = {
  level: '12th',
  stream: 'PCM',
  state: 'Karnataka',
  board: 'Karnataka',
  category: 'GM',
};

export function useStudentProfile() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [profile, setProfileState] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from URL params or localStorage
  useEffect(() => {
    let initial: Partial<StudentProfile> = {};

    // 1. Check URL search params
    if (searchParams) {
      const fromUrl = searchParamsToProfile(searchParams);
      if (fromUrl.level) {
        initial = { ...initial, ...fromUrl };
      }
    }

    // 2. Fall back to localStorage if URL params were not provided
    if (!initial.level && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.level) {
            initial = { ...initial, ...parsed };
          }
        }
      } catch (e) {
        console.warn('Could not read student profile from localStorage', e);
      }
    }

    setProfileState((prev) => ({
      ...prev,
      ...initial,
    }));
    setIsLoaded(true);
  }, [searchParams]);

  const updateProfile = useCallback(
    (updates: Partial<StudentProfile>, syncToUrl: boolean = false) => {
      setProfileState((prev) => {
        const next: StudentProfile = { ...prev, ...updates };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch (e) {
            console.warn('Could not write student profile to localStorage', e);
          }
        }

        if (syncToUrl && pathname) {
          const params = profileToSearchParams(next);
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }

        return next;
      });
    },
    [router, pathname]
  );

  const setLevel = useCallback(
    (level: StudentLevel, stream?: StudentStream) => {
      const defaultStream: StudentStream =
        stream ||
        (level === '12th' ? 'PCM' : level === '10th' ? 'Other' : 'Other');
      updateProfile({ level, stream: defaultStream }, true);
    },
    [updateProfile]
  );

  const resolution: JourneyResolution = getJourneyResolution(profile);

  return {
    profile,
    resolution,
    isLoaded,
    updateProfile,
    setLevel,
  };
}
