import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface Props {
  size?: number;
  strokeWidth?: number;
  progress: number;
  color?: string;
  gradientColors?: [string, string];
  label?: string;
  sublabel?: string;
  bgColor?: string;
}

export default function ProgressRing({
  size = 80, strokeWidth = 6, progress,
  color = COLORS.purple,
  gradientColors,
  label, sublabel,
  bgColor = '#F0EEFF',
}: Props) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));
  const gradId = `grad_${color.replace('#', '')}`;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {gradientColors && (
          <Defs>
            <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={gradientColors[0]} />
              <Stop offset="1" stopColor={gradientColors[1]} />
            </LinearGradient>
          </Defs>
        )}
        <Circle cx={size / 2} cy={size / 2} r={r}
          stroke={bgColor} strokeWidth={strokeWidth} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r}
          stroke={gradientColors ? `url(#${gradId})` : color}
          strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90" originX={size / 2} originY={size / 2}
        />
      </Svg>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { fontSize: size > 90 ? 18 : 13 }]}>{label}</Text>
          {sublabel && <Text style={[styles.sublabel, { fontSize: size > 90 ? 11 : 9 }]}>{sublabel}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  labelContainer: { alignItems: 'center' },
  label: { color: COLORS.textPrimary, fontWeight: '800', letterSpacing: -0.5 },
  sublabel: { color: COLORS.textSecondary, marginTop: 1, textAlign: 'center' },
});
