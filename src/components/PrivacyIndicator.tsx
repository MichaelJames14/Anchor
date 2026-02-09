import { View, Text, StyleSheet } from 'react-native';
import { palette, spacing, typography } from '../theme';

export const PrivacyIndicator = ({ text }: { text: string }) => (
  <View style={styles.container}>
    <Text style={styles.lock}>🔒</Text>
    <Text style={styles.text}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  lock: {
    color: palette.muted,
    fontSize: 14,
  },
  text: {
    ...typography.muted,
  },
});
