import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  defaultUserIntimacyProfile,
  IntimacyLevel,
  IntimacyPreferenceEntry,
  IntimacyRole,
  IntimacyVisibility,
} from '../models/intimacy';
import { palette, spacing, typography, cardStyle } from '../theme';
import { PrivacyIndicator } from '../components/PrivacyIndicator';
import { usePreferenceLibrary } from './usePreferenceLibrary';

const levels: IntimacyLevel[] = ['no', 'curious', 'yes', 'love'];
const levelLabels: Record<IntimacyLevel, string> = {
  no: 'No',
  curious: 'Curious',
  yes: 'Yes',
  love: 'Love',
};

const roles: IntimacyRole[] = ['give', 'receive', 'both', 'na'];
const roleLabels: Record<IntimacyRole, string> = {
  give: 'Give',
  receive: 'Receive',
  both: 'Both',
  na: 'N/A',
};

const visibilities: { value: IntimacyVisibility; label: string }[] = [
  { value: 'matching_only', label: 'Matching only (recommended)' },
  { value: 'matches', label: 'Visible to matches' },
  { value: 'public', label: 'Public (optional)' },
];

export const IntimacyPreferencesScreen = () => {
  const { items, loading } = usePreferenceLibrary();
  const [search, setSearch] = useState('');
  const [profile, setProfile] = useState(defaultUserIntimacyProfile);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snapshot = await getDoc(doc(db, 'users', user.uid));
      if (snapshot.exists()) {
        const data = snapshot.data();
        setProfile({
          ...defaultUserIntimacyProfile,
          ...data,
        });
      }
    };
    load();
  }, []);

  const updatePreference = (prefId: string, update: Partial<IntimacyPreferenceEntry>) => {
    setProfile((prev) => ({
      ...prev,
      intimacyPrefs: {
        ...prev.intimacyPrefs,
        [prefId]: {
          level: prev.intimacyPrefs[prefId]?.level ?? 'curious',
          ...prev.intimacyPrefs[prefId],
          ...update,
        },
      },
    }));
  };

  const save = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setSaving(true);
    await setDoc(
      doc(db, 'users', user.uid),
      {
        intimacyEnabled: profile.intimacyEnabled,
        intimacyVisibility: profile.intimacyVisibility,
        intimacyPrefs: profile.intimacyPrefs,
      },
      { merge: true }
    );
    setSaving(false);
  };

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={typography.title}>Intimacy Preferences</Text>
      <Text style={styles.notice}>18+ only. Consent-first and privacy-first.</Text>
      <Text style={styles.tagline}>
        This helps match compatible preferences. Keep it private if you want.
      </Text>
      <PrivacyIndicator text="Private by default until you choose otherwise." />
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Use intimacy preferences for matching</Text>
          <Switch
            value={profile.intimacyEnabled}
            onValueChange={(value) =>
              setProfile((prev) => ({ ...prev, intimacyEnabled: value }))
            }
            thumbColor={palette.secondary}
          />
        </View>
        <Text style={styles.sectionTitle}>Visibility</Text>
        {visibilities.map((visibility) => (
          <Pressable
            key={visibility.value}
            onPress={() =>
              setProfile((prev) => ({
                ...prev,
                intimacyVisibility: visibility.value,
              }))
            }
            style={[
              styles.choice,
              profile.intimacyVisibility === visibility.value && styles.choiceActive,
            ]}
          >
            <Text style={styles.choiceLabel}>{visibility.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <TextInput
          placeholder="Search preferences"
          placeholderTextColor={palette.muted}
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />
        {loading && <Text style={typography.muted}>Loading preferences…</Text>}
        {filtered.map((item) => (
          <View key={item.id} style={styles.preferenceRow}>
            <View style={styles.preferenceHeader}>
              <Text style={styles.preferenceLabel}>{item.label}</Text>
              <Text style={styles.preferenceCategory}>{item.category}</Text>
            </View>
            <View style={styles.choiceRow}>
              {levels.map((level) => (
                <Pressable
                  key={level}
                  onPress={() => updatePreference(item.id, { level })}
                  style={[
                    styles.levelPill,
                    profile.intimacyPrefs[item.id]?.level === level &&
                      styles.levelPillActive,
                  ]}
                >
                  <Text style={styles.levelText}>{levelLabels[level]}</Text>
                </Pressable>
              ))}
            </View>
            {item.requiresRole && (
              <View style={styles.choiceRow}>
                {roles.map((role) => (
                  <Pressable
                    key={role}
                    onPress={() => updatePreference(item.id, { role })}
                    style={[
                      styles.levelPill,
                      profile.intimacyPrefs[item.id]?.role === role &&
                        styles.levelPillActive,
                    ]}
                  >
                    <Text style={styles.levelText}>{roleLabels[role]}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
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
  notice: {
    ...typography.muted,
    color: palette.secondary,
  },
  card: {
    ...cardStyle,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.body,
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
    borderColor: palette.secondary,
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  choiceLabel: {
    color: palette.text,
  },
  search: {
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    color: palette.text,
  },
  preferenceRow: {
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  preferenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  preferenceLabel: {
    color: palette.text,
    fontWeight: '600',
  },
  preferenceCategory: {
    color: palette.muted,
    fontSize: 12,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  levelPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderColor: palette.border,
    borderWidth: 1,
  },
  levelPillActive: {
    borderColor: palette.primary,
    backgroundColor: 'rgba(37,99,235,0.18)',
  },
  levelText: {
    color: palette.text,
    fontSize: 12,
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
