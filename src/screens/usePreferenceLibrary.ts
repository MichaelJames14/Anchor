import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { IntimacyPreferenceItem } from '../models/intimacy';

export const usePreferenceLibrary = () => {
  const [items, setItems] = useState<IntimacyPreferenceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(db, 'preferences'), where('active', '==', true))
        );
        if (!mounted) return;
        const next = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<IntimacyPreferenceItem, 'id'>),
        }));
        setItems(next);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return { items, loading };
};
