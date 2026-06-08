import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS } from '../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'gradient' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  disabled?: boolean;
  colors?: string[];
}

export default function PillButton({
  label, onPress, variant = 'gradient', size = 'md', style, disabled, colors
}: Props) {
  const height = size === 'sm' ? 36 : size === 'lg' ? 56 : 46;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 17 : 15;

  if (variant === 'gradient') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} style={style} activeOpacity={0.8}>
        <LinearGradient
          colors={(colors || COLORS.gradientPrimary) as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, { height, borderRadius: height / 2 }]}
        >
          <Text style={[styles.labelGradient, { fontSize }]}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[styles.outline, { height, borderRadius: height / 2 }, style]}
        activeOpacity={0.7}
      >
        <Text style={[styles.labelOutline, { fontSize }]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.ghost, { height, borderRadius: height / 2 }, style]}
      activeOpacity={0.6}
    >
      <Text style={[styles.labelGhost, { fontSize }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  labelGradient: {
    color: '#0A0A0F',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  outline: {
    borderWidth: 1,
    borderColor: COLORS.bgGlassBorder,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  labelOutline: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  ghost: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  labelGhost: {
    color: COLORS.accent,
    fontWeight: '600',
  },
});
