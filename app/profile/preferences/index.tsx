import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { palette, spacing, typography, cardStyle } from '../../../src/theme';

export default function PreferencesHome() {
  return (
    <View style={styles.container}>
      <Text style={typography.title}>Preferences</Text>
      <View style={styles.card}>
        <Link href="/profile/preferences/intimacy" asChild>
          <Pressable style={styles.linkRow}>
            <Text style={styles.linkText}>Intimacy Preferences</Text>
          </Pressable>
        </Link>
        <Link href="/profile/preferences/non-negotiables" asChild>
          <Pressable style={styles.linkRow}>
            <Text style={styles.linkText}>Non-Negotiables</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    ...cardStyle,
    gap: spacing.sm,
  },
  linkRow: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  linkText: {
    color: palette.text,
    fontWeight: '600',
  },
});
