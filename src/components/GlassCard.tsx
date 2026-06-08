import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'soft' | 'purple' | 'rose';
  noPadding?: boolean;
}

export default function GlassCard({ children, style, variant = 'default', noPadding }: Props) {
  return (
    <View style={[
      styles.card,
      variant === 'soft' ? styles.soft : variant === 'purple' ? styles.purple : variant === 'rose' ? styles.rose : styles.default,
      SHADOW.sm,
      noPadding && styles.noPadding,
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.lg, padding: 16 },
  default: { backgroundColor: COLORS.bgCard },
  soft: { backgroundColor: COLORS.bgCardSoft },
  purple: { backgroundColor: COLORS.purpleLight },
  rose: { backgroundColor: COLORS.roseGoldLight },
  noPadding: { padding: 0 },
});
