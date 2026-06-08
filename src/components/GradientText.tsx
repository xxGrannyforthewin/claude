import React from 'react';
import { Text, TextStyle } from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  children: string;
  style?: TextStyle;
  gradient?: 'primary' | 'warm' | 'cool';
}

// Simplified gradient text (no native gradient text on RN, use accent color)
export default function GradientText({ children, style, gradient = 'primary' }: Props) {
  const color = gradient === 'warm'
    ? COLORS.accentWarm
    : gradient === 'cool'
    ? COLORS.accentAlt
    : COLORS.accent;

  return <Text style={[{ color }, style]}>{children}</Text>;
}
