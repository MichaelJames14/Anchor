export type IntimacyLevel = 'no' | 'curious' | 'yes' | 'love';
export type IntimacyRole = 'give' | 'receive' | 'both' | 'na';
export type IntimacyPreferenceEntry = {
  level: IntimacyLevel;
  role?: IntimacyRole;
};

export type IntimacyVisibility = 'matching_only' | 'matches' | 'public';

export type NonNegotiables = {
  mustHave: string[];
  hardNo: string[];
};

export type UserProfile = {
  uid: string;
  name: string;
  age: number;
  location: string;
  verified?: boolean;
  profileCompletion?: number;
  intimacyEnabled?: boolean;
  intimacyVisibility?: IntimacyVisibility;
  intimacyPrefs?: Record<string, IntimacyPreferenceEntry>;
  nonNegotiables?: NonNegotiables;
  baseScore?: number;
};

export type PreferenceItem = {
  id: string;
  requiresRole: boolean;
  active: boolean;
};

export const levelScore: Record<IntimacyLevel, number> = {
  no: 0,
  curious: 1,
  yes: 2,
  love: 3,
};

export const isLevelSatisfied = (entry?: IntimacyPreferenceEntry) => {
  return entry?.level === 'yes' || entry?.level === 'love';
};

export const passesHardFilters = (
  viewer: UserProfile,
  candidate: UserProfile
) => {
  const viewerNon = viewer.nonNegotiables ?? { mustHave: [], hardNo: [] };
  const candidateNon = candidate.nonNegotiables ?? { mustHave: [], hardNo: [] };
  const candidatePrefs = candidate.intimacyPrefs ?? {};
  const viewerPrefs = viewer.intimacyPrefs ?? {};

  const mustHaveFail = viewerNon.mustHave.some(
    (prefId) => !isLevelSatisfied(candidatePrefs[prefId])
  );
  if (mustHaveFail) return false;

  const conflictViewer = viewerNon.hardNo.some((prefId) =>
    candidateNon.mustHave.includes(prefId)
  );
  if (conflictViewer) return false;

  const conflictCandidate = candidateNon.hardNo.some((prefId) =>
    viewerNon.mustHave.includes(prefId)
  );
  if (conflictCandidate) return false;

  return true;
};

export const computeIntimacyScore = (
  viewer: UserProfile,
  candidate: UserProfile,
  preferenceItems: PreferenceItem[]
) => {
  const viewerPrefs = viewer.intimacyPrefs ?? {};
  const candidatePrefs = candidate.intimacyPrefs ?? {};

  const activeItems = preferenceItems.filter((item) => item.active);
  if (!activeItems.length) return 0;

  let total = 0;
  let count = 0;

  for (const item of activeItems) {
    const viewerPref = viewerPrefs[item.id];
    const candidatePref = candidatePrefs[item.id];
    if (!viewerPref && !candidatePref) continue;

    const a = levelScore[viewerPref?.level ?? 'curious'];
    const b = levelScore[candidatePref?.level ?? 'curious'];
    const base = 1 - Math.abs(a - b) / 3;
    let bonus = 0;

    if (item.requiresRole) {
      const aRole = viewerPref?.role ?? 'na';
      const bRole = candidatePref?.role ?? 'na';
      if (
        (aRole === 'give' && bRole === 'receive') ||
        (aRole === 'receive' && bRole === 'give')
      ) {
        bonus += 0.15;
      } else if (aRole === 'both' && bRole === 'both') {
        bonus += 0.1;
      } else if (aRole !== 'na' && bRole !== 'na' && aRole !== bRole) {
        bonus -= 0.25;
      }
    }

    total += Math.max(0, base + bonus);
    count += 1;
  }

  return count ? total / count : 0;
};

export const computeFinalScore = (
  baseScore: number,
  intimacyScore: number,
  intimacyWeight = 0.35
) => {
  const baseWeight = 1 - intimacyWeight;
  return intimacyWeight * intimacyScore + baseWeight * baseScore;
};

export const compatibilityLabel = (score: number) => {
  if (score >= 0.75) return 'High';
  if (score >= 0.45) return 'Medium';
  return 'Low';
};
