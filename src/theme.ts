export const palette = {
  primary: '#2563EB',
  secondary: '#10B981',
  background: '#0B1220',
  surface: '#111B2E',
  text: '#EAF0FF',
  muted: '#9FB0C4',
  border: 'rgba(255,255,255,0.10)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: palette.text,
  },
  body: {
    fontSize: 16,
    color: palette.text,
  },
  muted: {
    fontSize: 14,
    color: palette.muted,
  },
};

export const cardStyle = {
  backgroundColor: palette.surface,
  borderColor: palette.border,
  borderWidth: 1,
  borderRadius: 16,
  padding: spacing.md,
};

export const buttonGradient = [palette.primary, palette.secondary];
