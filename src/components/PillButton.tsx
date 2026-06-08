import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS } from '../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'gradient' | 'outline' | 'ghost' | 'light';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  disabled?: boolean;
  colors?: string[];
}

export default function PillButton({ label, onPress, variant = 'gradient', size = 'md', style, disabled, colors }: Props) {
  const height = size === 'sm' ? 34 : size === 'lg' ? 54 : 46;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 17 : 15;

  if (variant === 'gradient') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} style={style} activeOpacity={0.85}>
        <LinearGradient
          colors={(colors || COLORS.gradientPurple) as [string, string]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[styles.base, { height, borderRadius: height / 2 }]}
        >
          <Text style={[styles.labelGradient, { fontSize }]}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'light') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled}
        style={[styles.light, { height, borderRadius: height / 2 }, style]} activeOpacity={0.8}>
        <Text style={[styles.labelLight, { fontSize }]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled}
        style={[styles.outline, { height, borderRadius: height / 2 }, style]} activeOpacity={0.7}>
        <Text style={[styles.labelOutline, { fontSize }]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}
      style={[styles.ghost, { height, borderRadius: height / 2 }, style]} activeOpacity={0.6}>
      <Text style={[styles.labelGhost, { fontSize }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  labelGradient: { color: '#FFFFFF', fontWeight: '700', letterSpacing: 0.2 },
  light: { backgroundColor: COLORS.purpleLight, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  labelLight: { color: COLORS.purple, fontWeight: '700' },
  outline: { borderWidth: 1.5, borderColor: COLORS.purple, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  labelOutline: { color: COLORS.purple, fontWeight: '600' },
  ghost: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  labelGhost: { color: COLORS.purple, fontWeight: '600' },
});
