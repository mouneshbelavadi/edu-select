export interface StateConfig {
  name: string;
  slug: string;
  imagePath: string;
  icon: string;
  accentGradient: string;
}

export const STATE_CONFIGS: Record<string, StateConfig> = {
  'Andhra Pradesh': {
    name: 'Andhra Pradesh',
    slug: 'andhra-pradesh',
    imagePath: '/images/states/andhra-pradesh.webp',
    icon: '🏛️',
    accentGradient: 'from-blue-600 to-indigo-700',
  },
  'Arunachal Pradesh': {
    name: 'Arunachal Pradesh',
    slug: 'arunachal-pradesh',
    imagePath: '/images/states/arunachal-pradesh.webp',
    icon: '🏔️',
    accentGradient: 'from-emerald-600 to-teal-700',
  },
  'Assam': {
    name: 'Assam',
    slug: 'assam',
    imagePath: '/images/states/assam.webp',
    icon: '🦏',
    accentGradient: 'from-green-600 to-emerald-700',
  },
  'Bihar': {
    name: 'Bihar',
    slug: 'bihar',
    imagePath: '/images/states/bihar.webp',
    icon: '📜',
    accentGradient: 'from-amber-600 to-orange-700',
  },
  'Chhattisgarh': {
    name: 'Chhattisgarh',
    slug: 'chhattisgarh',
    imagePath: '/images/states/chhattisgarh.webp',
    icon: '🌳',
    accentGradient: 'from-teal-600 to-cyan-700',
  },
  'Goa': {
    name: 'Goa',
    slug: 'goa',
    imagePath: '/images/states/goa.webp',
    icon: '🏖️',
    accentGradient: 'from-cyan-500 to-blue-600',
  },
  'Gujarat': {
    name: 'Gujarat',
    slug: 'gujarat',
    imagePath: '/images/states/gujarat.webp',
    icon: '🦁',
    accentGradient: 'from-orange-500 to-amber-600',
  },
  'Haryana': {
    name: 'Haryana',
    slug: 'haryana',
    imagePath: '/images/states/haryana.webp',
    icon: '🌾',
    accentGradient: 'from-lime-600 to-green-700',
  },
  'Himachal Pradesh': {
    name: 'Himachal Pradesh',
    slug: 'himachal-pradesh',
    imagePath: '/images/states/himachal-pradesh.webp',
    icon: '⛰️',
    accentGradient: 'from-sky-600 to-indigo-700',
  },
  'Jharkhand': {
    name: 'Jharkhand',
    slug: 'jharkhand',
    imagePath: '/images/states/jharkhand.webp',
    icon: '⛏️',
    accentGradient: 'from-stone-600 to-slate-700',
  },
  'Karnataka': {
    name: 'Karnataka',
    slug: 'karnataka',
    imagePath: '/images/states/karnataka.webp',
    icon: '🏛️',
    accentGradient: 'from-red-600 to-amber-600',
  },
  'Kerala': {
    name: 'Kerala',
    slug: 'kerala',
    imagePath: '/images/states/kerala.webp',
    icon: '🌴',
    accentGradient: 'from-emerald-600 to-green-700',
  },
  'Madhya Pradesh': {
    name: 'Madhya Pradesh',
    slug: 'madhya-pradesh',
    imagePath: '/images/states/madhya-pradesh.webp',
    icon: '🐅',
    accentGradient: 'from-amber-600 to-yellow-600',
  },
  'Maharashtra': {
    name: 'Maharashtra',
    slug: 'maharashtra',
    imagePath: '/images/states/maharashtra.webp',
    icon: '🏢',
    accentGradient: 'from-orange-600 to-red-700',
  },
  'Manipur': {
    name: 'Manipur',
    slug: 'manipur',
    imagePath: '/images/states/manipur.webp',
    icon: '🌸',
    accentGradient: 'from-pink-600 to-rose-700',
  },
  'Meghalaya': {
    name: 'Meghalaya',
    slug: 'meghalaya',
    imagePath: '/images/states/meghalaya.webp',
    icon: '☁️',
    accentGradient: 'from-blue-500 to-teal-600',
  },
  'Mizoram': {
    name: 'Mizoram',
    slug: 'mizoram',
    imagePath: '/images/states/mizoram.webp',
    icon: '🌿',
    accentGradient: 'from-emerald-500 to-teal-700',
  },
  'Nagaland': {
    name: 'Nagaland',
    slug: 'nagaland',
    imagePath: '/images/states/nagaland.webp',
    icon: '🦅',
    accentGradient: 'from-amber-700 to-red-800',
  },
  'Odisha': {
    name: 'Odisha',
    slug: 'odisha',
    imagePath: '/images/states/odisha.webp',
    icon: '☸️',
    accentGradient: 'from-orange-600 to-amber-700',
  },
  'Punjab': {
    name: 'Punjab',
    slug: 'punjab',
    imagePath: '/images/states/punjab.webp',
    icon: '🌾',
    accentGradient: 'from-yellow-500 to-amber-600',
  },
  'Rajasthan': {
    name: 'Rajasthan',
    slug: 'rajasthan',
    imagePath: '/images/states/rajasthan.webp',
    icon: '🏰',
    accentGradient: 'from-amber-600 to-rose-700',
  },
  'Sikkim': {
    name: 'Sikkim',
    slug: 'sikkim',
    imagePath: '/images/states/sikkim.webp',
    icon: '🏔️',
    accentGradient: 'from-indigo-600 to-purple-700',
  },
  'Tamil Nadu': {
    name: 'Tamil Nadu',
    slug: 'tamil-nadu',
    imagePath: '/images/states/tamil-nadu.webp',
    icon: '🛕',
    accentGradient: 'from-amber-700 to-red-700',
  },
  'Telangana': {
    name: 'Telangana',
    slug: 'telangana',
    imagePath: '/images/states/telangana.webp',
    icon: '💻',
    accentGradient: 'from-blue-600 to-purple-700',
  },
  'Tripura': {
    name: 'Tripura',
    slug: 'tripura',
    imagePath: '/images/states/tripura.webp',
    icon: '🏯',
    accentGradient: 'from-rose-600 to-pink-700',
  },
  'Uttar Pradesh': {
    name: 'Uttar Pradesh',
    slug: 'uttar-pradesh',
    imagePath: '/images/states/uttar-pradesh.webp',
    icon: '🕌',
    accentGradient: 'from-emerald-700 to-teal-800',
  },
  'Uttarakhand': {
    name: 'Uttarakhand',
    slug: 'uttarakhand',
    imagePath: '/images/states/uttarakhand.webp',
    icon: '🌲',
    accentGradient: 'from-teal-700 to-emerald-800',
  },
  'West Bengal': {
    name: 'West Bengal',
    slug: 'west-bengal',
    imagePath: '/images/states/west-bengal.webp',
    icon: '🐅',
    accentGradient: 'from-red-600 to-amber-700',
  },
};

export function getStateSlug(stateName: string): string {
  const match = STATE_CONFIGS[stateName];
  if (match) return match.slug;
  return stateName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function getStateConfig(stateName: string): StateConfig {
  const match = STATE_CONFIGS[stateName];
  if (match) return match;

  const slug = getStateSlug(stateName);
  return {
    name: stateName,
    slug,
    imagePath: `/images/states/${slug}.webp`,
    icon: '📍',
    accentGradient: 'from-blue-600 to-slate-700',
  };
}

export function getStateImagePath(stateName: string): string {
  return getStateConfig(stateName).imagePath;
}

export const ALL_STATE_CONFIGS: StateConfig[] = Object.values(STATE_CONFIGS);
