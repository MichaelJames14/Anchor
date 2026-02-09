import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export type DiscoverCandidate = {
  uid: string;
  name: string;
  age: number;
  location: string;
  verified?: boolean;
  profileCompletion?: number;
  compatibilityLabel: 'High' | 'Medium' | 'Low';
  meetsNonNegotiables: boolean;
};

export type DiscoverResponse = {
  candidates: DiscoverCandidate[];
  nextCursor?: string;
};

export const fetchDiscoverFeed = async (cursor?: string) => {
  const callable = httpsCallable(functions, 'getDiscoverFeed');
  const response = await callable({ cursor });
  return response.data as DiscoverResponse;
};
