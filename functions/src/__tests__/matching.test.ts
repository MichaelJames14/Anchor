import {
  computeFinalScore,
  computeIntimacyScore,
  passesHardFilters,
  PreferenceItem,
} from '../matching';

const preferenceItems: PreferenceItem[] = [
  { id: 'pref1', requiresRole: false, active: true },
  { id: 'pref2', requiresRole: true, active: true },
];

describe('matching logic', () => {
  it('filters out candidates missing must-haves', () => {
    const viewer = {
      nonNegotiables: { mustHave: ['pref1'], hardNo: [] },
    };
    const candidate = {
      nonNegotiables: { mustHave: [], hardNo: [] },
      intimacyPrefs: { pref1: { level: 'curious' } },
    };
    expect(passesHardFilters(viewer, candidate)).toBe(false);
  });

  it('allows candidates with must-have satisfied', () => {
    const viewer = {
      nonNegotiables: { mustHave: ['pref1'], hardNo: [] },
    };
    const candidate = {
      nonNegotiables: { mustHave: [], hardNo: [] },
      intimacyPrefs: { pref1: { level: 'yes' } },
    };
    expect(passesHardFilters(viewer, candidate)).toBe(true);
  });

  it('scores intimacy with role complement bonus', () => {
    const viewer = {
      intimacyPrefs: {
        pref1: { level: 'love' },
        pref2: { level: 'yes', role: 'give' },
      },
    };
    const candidate = {
      intimacyPrefs: {
        pref1: { level: 'yes' },
        pref2: { level: 'yes', role: 'receive' },
      },
    };
    const score = computeIntimacyScore(viewer, candidate, preferenceItems);
    expect(score).toBeGreaterThan(0.5);
  });

  it('combines base and intimacy score', () => {
    const final = computeFinalScore(0.6, 0.8);
    expect(final).toBeCloseTo(0.67, 2);
  });
});
