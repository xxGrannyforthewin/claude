import React from 'react';
import { Text, TextStyle } from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  children: string;
  style?: TextStyle;
  gradient?: 'primary' | 'warm' | 'cool';
}

export default function GradientText({ children, style, gradient = 'primary' }: Props) {
  const color = gradient === 'warm' ? COLORS.roseGold : gradient === 'cool' ? COLORS.blue : COLORS.purple;
  return <Text style={[{ color }, style]}>{children}</Text>;
}
