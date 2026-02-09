import { Stack } from 'expo-router';
import { palette } from '../src/theme';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.surface },
        headerTintColor: palette.text,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: palette.background },
      }}
    />
  );
}
