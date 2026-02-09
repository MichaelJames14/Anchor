export type IntimacyLevel = 'no' | 'curious' | 'yes' | 'love';
export type IntimacyRole = 'give' | 'receive' | 'both' | 'na';
export type IntimacyFrequency = 'rare' | 'sometimes' | 'often';
export type IntimacyVisibility = 'matching_only' | 'matches' | 'public';

export type IntimacyPreferenceEntry = {
  level: IntimacyLevel;
  role?: IntimacyRole;
  frequency?: IntimacyFrequency;
};

export type NonNegotiables = {
  mustHave: string[];
  hardNo: string[];
};

export type IntimacyPreferenceItem = {
  id: string;
  label: string;
  category: string;
  requiresRole: boolean;
  isSensitive: boolean;
  active: boolean;
};

export type UserIntimacyProfile = {
  intimacyEnabled: boolean;
  intimacyVisibility: IntimacyVisibility;
  intimacyPrefs: Record<string, IntimacyPreferenceEntry>;
  nonNegotiables: NonNegotiables;
};

export const defaultUserIntimacyProfile: UserIntimacyProfile = {
  intimacyEnabled: false,
  intimacyVisibility: 'matching_only',
  intimacyPrefs: {},
  nonNegotiables: {
    mustHave: [],
    hardNo: [],
  },
};
