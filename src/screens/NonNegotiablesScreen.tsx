import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  defaultUserIntimacyProfile,
  NonNegotiables,
} from '../models/intimacy';
import { palette, spacing, typography, cardStyle } from '../theme';
import { PrivacyIndicator } from '../components/PrivacyIndicator';
import { usePreferenceLibrary } from './usePreferenceLibrary';

export const NonNegotiablesScreen = () => {
  const { items, loading } = usePreferenceLibrary();
  const [search, setSearch] = useState('');
  const [nonNegotiables, setNonNegotiables] = useState<NonNegotiables>(
    defaultUserIntimacyProfile.nonNegotiables
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snapshot = await getDoc(doc(db, 'users', user.uid));
      if (snapshot.exists()) {
        const data = snapshot.data();
        setNonNegotiables({
          ...defaultUserIntimacyProfile.nonNegotiables,
          ...data.nonNegotiables,
        });
      }
    };

    load();
  }, []);

  const toggleSelection = (section: 'mustHave' | 'hardNo', prefId: string) => {
    setNonNegotiables((prev) => {
      const otherSection = section === 'mustHave' ? 'hardNo' : 'mustHave';
      const next = prev[section].includes(prefId)
        ? prev[section].filter((id) => id !== prefId)
        : [...prev[section], prefId];
      return {
        ...prev,
        [section]: next,
        [otherSection]: prev[otherSection].filter((id) => id !== prefId),
      };
    });
  };

  const save = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setSaving(true);
    await setDoc(
      doc(db, 'users', user.uid),
      { nonNegotiables },
      { merge: true }
    );
    setSaving(false);
  };

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={typography.title}>Non-Negotiables</Text>
      <Text style={styles.tagline}>
        Set requirements and boundaries so we only show respectful matches.
      </Text>
      <PrivacyIndicator text="Only used for matching. Never shown publicly." />

      <View style={styles.card}>
        <TextInput
          placeholder="Search preferences"
          placeholderTextColor={palette.muted}
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />
        {loading && <Text style={typography.muted}>Loading preferences…</Text>}
        <Text style={styles.sectionTitle}>Must-Haves</Text>
        {filtered.map((item) => (
          <Pressable
            key={`must-${item.id}`}
            onPress={() => toggleSelection('mustHave', item.id)}
            style={[
              styles.choice,
              nonNegotiables.mustHave.includes(item.id) && styles.choiceActive,
            ]}
          >
            <Text style={styles.choiceLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Hard No’s</Text>
        {filtered.map((item) => (
          <Pressable
            key={`hard-${item.id}`}
            onPress={() => toggleSelection('hardNo', item.id)}
            style={[
              styles.choice,
              nonNegotiables.hardNo.includes(item.id) && styles.choiceHard,
            ]}
          >
            <Text style={styles.choiceLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.saveButton} onPress={save} disabled={saving}>
        <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save'}</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  tagline: {
    ...typography.muted,
  },
  card: {
    ...cardStyle,
    gap: spacing.sm,
  },
  search: {
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    color: palette.text,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  choice: {
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  choiceActive: {
    borderColor: palette.primary,
    backgroundColor: 'rgba(37,99,235,0.15)',
  },
  choiceHard: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  choiceLabel: {
    color: palette.text,
  },
  saveButton: {
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: palette.primary,
    alignItems: 'center',
  },
  saveText: {
    color: palette.text,
    fontWeight: '700',
  },
});
