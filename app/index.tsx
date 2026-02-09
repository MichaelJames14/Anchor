import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { fetchDiscoverFeed, DiscoverCandidate } from '../src/api/discover';
import { palette, spacing, typography, cardStyle } from '../src/theme';

export default function DiscoverScreen() {
  const [candidates, setCandidates] = useState<DiscoverCandidate[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await fetchDiscoverFeed();
      setCandidates(response.candidates);
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anchor</Text>
      <Text style={styles.tagline}>Find your anchor.</Text>
      <FlatList
        data={candidates}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.name}>
                {item.name}, {item.age}
              </Text>
              {item.verified && <Text style={styles.badge}>Verified</Text>}
            </View>
            <Text style={styles.location}>{item.location}</Text>
            <Text style={styles.completion}>
              Profile depth: {item.profileCompletion ?? 0}%
            </Text>
            <Text style={styles.compatibility}>
              Compatibility: {item.compatibilityLabel}
            </Text>
            {item.meetsNonNegotiables && (
              <Text style={styles.nonNegotiables}>Meets your non-negotiables</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    padding: spacing.lg,
  },
  title: {
    ...typography.title,
  },
  tagline: {
    ...typography.muted,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    ...cardStyle,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    color: palette.secondary,
    fontWeight: '600',
  },
  location: {
    ...typography.muted,
  },
  completion: {
    ...typography.muted,
    marginTop: spacing.sm,
  },
  compatibility: {
    color: palette.text,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  nonNegotiables: {
    color: palette.secondary,
    marginTop: spacing.xs,
  },
});
