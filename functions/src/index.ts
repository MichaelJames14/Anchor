import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  compatibilityLabel,
  computeFinalScore,
  computeIntimacyScore,
  passesHardFilters,
  PreferenceItem,
  UserProfile,
} from './matching';

admin.initializeApp();
const db = admin.firestore();

const preferenceSeed: Omit<
  PreferenceItem & {
    label: string;
    category: string;
    isSensitive: boolean;
  },
  'id'
>[] = [
  {
    label: 'Dominant/Submissive dynamic',
    category: 'style',
    requiresRole: true,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Light bondage',
    category: 'style',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Roleplay',
    category: 'style',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Slow build / sensual pace',
    category: 'frequency',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Affection-focused intimacy',
    category: 'boundaries',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Praise and encouragement',
    category: 'style',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Mutual exploration',
    category: 'style',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Outdoor adventure dates',
    category: 'boundaries',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Aftercare & check-ins',
    category: 'boundaries',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Consent check-ins',
    category: 'boundaries',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Morning intimacy',
    category: 'frequency',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Evening intimacy',
    category: 'frequency',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Spontaneous moments',
    category: 'frequency',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Structured planning',
    category: 'frequency',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Sensory focus (touch)',
    category: 'style',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Playful teasing',
    category: 'style',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Mutual massage',
    category: 'style',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Shared shower/bath time',
    category: 'style',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Audio/visual ambiance',
    category: 'style',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Communication before intimacy',
    category: 'boundaries',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Open to learning together',
    category: 'boundaries',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Creative date lead-in',
    category: 'style',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
  {
    label: 'Frequent cuddling',
    category: 'frequency',
    requiresRole: false,
    isSensitive: true,
    active: true,
  },
];

export const seedPreferenceLibrary = functions.https.onCall(async () => {
  const batch = db.batch();
  preferenceSeed.forEach((item) => {
    const ref = db.collection('preferences').doc();
    batch.set(ref, item);
  });
  await batch.commit();
  return { count: preferenceSeed.length };
});

const isMatch = async (viewerId: string, candidateId: string) => {
  const matchDoc = await db
    .collection('matches')
    .doc(viewerId)
    .collection('connections')
    .doc(candidateId)
    .get();
  return matchDoc.exists;
};

export const getDiscoverFeed = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }
  const viewerId = context.auth.uid;
  const cursor = data?.cursor;

  const viewerSnapshot = await db.collection('users').doc(viewerId).get();
  const viewer = viewerSnapshot.data() as UserProfile;

  const preferenceSnapshot = await db
    .collection('preferences')
    .where('active', '==', true)
    .get();
  const preferenceItems = preferenceSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<PreferenceItem, 'id'>),
  }));

  let query = db.collection('users').limit(50);
  if (cursor) {
    const cursorDoc = await db.collection('users').doc(cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  const candidatesSnapshot = await query.get();
  const candidates: Array<UserProfile & { uid: string }> = candidatesSnapshot.docs
    .filter((doc) => doc.id !== viewerId)
    .map((doc) => ({ uid: doc.id, ...(doc.data() as UserProfile) }));

  const filtered = candidates.filter((candidate) =>
    passesHardFilters(viewer, candidate)
  );

  const scored = await Promise.all(
    filtered.map(async (candidate) => {
      const intimacyScore = computeIntimacyScore(
        viewer,
        candidate,
        preferenceItems
      );
      const baseScore = candidate.baseScore ?? 0.5;
      const finalScore = computeFinalScore(baseScore, intimacyScore);
      const match = await isMatch(viewerId, candidate.uid);
      const visibility = candidate.intimacyVisibility ?? 'matching_only';
      const canViewIntimacy =
        visibility === 'public' || (visibility === 'matches' && match);

      return {
        uid: candidate.uid,
        name: candidate.name,
        age: candidate.age,
        location: candidate.location,
        verified: candidate.verified,
        profileCompletion: candidate.profileCompletion,
        finalScore,
        compatibilityLabel: compatibilityLabel(finalScore),
        meetsNonNegotiables: true,
        canViewIntimacy,
      };
    })
  );

  scored.sort((a, b) => b.finalScore - a.finalScore);

  const topCount = Math.ceil(scored.length * 0.8);
  const top = scored.slice(0, topCount);
  const rest = scored.slice(topCount);
  const shuffledRest = rest.sort(() => Math.random() - 0.5);

  const responseCandidates = [...top, ...shuffledRest]
    .slice(0, 20)
    .map((candidate) => ({
      uid: candidate.uid,
      name: candidate.name,
      age: candidate.age,
      location: candidate.location,
      verified: candidate.verified,
      profileCompletion: candidate.profileCompletion,
      compatibilityLabel: candidate.compatibilityLabel,
      meetsNonNegotiables: candidate.meetsNonNegotiables,
      privacy: candidate.canViewIntimacy ? 'matches' : 'hidden',
    }));

  const nextCursor = candidatesSnapshot.docs[candidatesSnapshot.docs.length - 1]?.id;

  return { candidates: responseCandidates, nextCursor };
});
