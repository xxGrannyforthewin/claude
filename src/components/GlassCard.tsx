import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'accent' | 'dark';
  noPadding?: boolean;
}

export default function GlassCard({ children, style, variant = 'default', noPadding }: Props) {
  const variantStyle = variant === 'accent'
    ? styles.accent
    : variant === 'dark'
    ? styles.dark
    : styles.default;

  return (
    <View style={[styles.card, variantStyle, noPadding && styles.noPadding, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
  },
  default: {
    backgroundColor: COLORS.bgGlass,
    borderColor: COLORS.bgGlassBorder,
  },
  accent: {
    backgroundColor: 'rgba(200, 184, 255, 0.08)',
    borderColor: 'rgba(200, 184, 255, 0.20)',
  },
  dark: {
    backgroundColor: 'rgba(10, 10, 15, 0.6)',
    borderColor: COLORS.border,
  },
  noPadding: {
    padding: 0,
  },
});
