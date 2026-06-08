import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import ProgressRing from '../components/ProgressRing';
import { Storage } from '../store/storage';
import { WaterLog, NutritionLog, WeightLog, CheckIn, DoseLog, SideEffect } from '../types';

export default function InsightsScreen() {
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [sideEffects, setSideEffects] = useState<SideEffect[]>([]);

  const load = useCallback(async () => {
    const [water, nutrition, weight, checks, doses, effects] = await Promise.all([
      Storage.get<WaterLog>(Storage.KEYS.WATER_LOGS),
      Storage.get<NutritionLog>(Storage.KEYS.NUTRITION_LOGS),
      Storage.get<WeightLog>(Storage.KEYS.WEIGHT_LOGS),
      Storage.get<CheckIn>(Storage.KEYS.CHECK_INS),
      Storage.get<DoseLog>(Storage.KEYS.DOSE_LOGS),
      Storage.get<SideEffect>(Storage.KEYS.SIDE_EFFECTS),
    ]);
    setWaterLogs(water);
    setNutritionLogs(nutrition);
    setWeightLogs(weight.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    setCheckIns(checks);
    setDoseLogs(doses);
    setSideEffects(effects);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const last7Days = (logs: { timestamp: string }[]) => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return logs.filter(l => new Date(l.timestamp) >= d);
  };

  const weekWater = last7Days(waterLogs).reduce((s, l) => s + (l as WaterLog).amount, 0);
  const weekDoses = last7Days(doseLogs).length;
  const avgMood = checkIns.length > 0
    ? (checkIns.reduce((s, c) => s + c.mood, 0) / checkIns.length).toFixed(1)
    : '--';
  const avgEnergy = checkIns.length > 0
    ? (checkIns.reduce((s, c) => s + c.energy, 0) / checkIns.length).toFixed(1)
    : '--';

  const weightChange = weightLogs.length >= 2
    ? (weightLogs[weightLogs.length - 1].weight - weightLogs[0].weight).toFixed(1)
    : null;

  const weeklyCalAvg = (() => {
    const recent = last7Days(nutritionLogs);
    if (recent.length === 0) return 0;
    return Math.round(recent.reduce((s, l) => s + (l as NutritionLog).calories, 0) / 7);
  })();

  const symptomFreq: Record<string, number> = {};
  sideEffects.forEach(s => {
    symptomFreq[s.symptom] = (symptomFreq[s.symptom] || 0) + 1;
  });
  const topSymptoms = Object.entries(symptomFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0A0F', '#0A0F18']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Overview rings */}
        <GlassCard variant="accent" style={styles.overviewCard}>
          <Text style={styles.cardTitle}>WEEKLY OVERVIEW</Text>
          <View style={styles.ringsRow}>
            <View style={styles.ringItem}>
              <ProgressRing size={72} strokeWidth={6} progress={weekWater / (2500 * 7)} color={COLORS.accentAlt} label={`${(weekWater / 1000).toFixed(0)}L`} sublabel="Hydration" />
            </View>
            <View style={styles.ringItem}>
              <ProgressRing size={72} strokeWidth={6} progress={weekDoses / 14} color={COLORS.accent} label={`${weekDoses}`} sublabel="Doses" />
            </View>
            <View style={styles.ringItem}>
              <ProgressRing size={72} strokeWidth={6} progress={weeklyCalAvg / 2000} color={COLORS.accentWarm} label={`${weeklyCalAvg}`} sublabel="kcal/day" />
            </View>
          </View>
        </GlassCard>

        {/* Wellbeing */}
        <Text style={styles.sectionLabel}>WELLBEING</Text>
        <View style={styles.wellbeingRow}>
          {[
            { label: 'Avg Mood', value: avgMood, icon: 'happy', color: COLORS.accentYellow },
            { label: 'Avg Energy', value: avgEnergy, icon: 'flash', color: COLORS.accentWarm },
            { label: 'Check-ins', value: checkIns.length.toString(), icon: 'checkmark-circle', color: COLORS.accentGreen },
          ].map(item => (
            <GlassCard key={item.label} style={[styles.wellCard, { flex: 1 }] as any}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
              <Text style={[styles.wellValue, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.wellLabel}>{item.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Weight trend */}
        {weightLogs.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>WEIGHT TREND</Text>
            <GlassCard style={styles.weightCard}>
              <View style={styles.weightRow}>
                <View style={styles.weightStat}>
                  <Text style={styles.weightValue}>{weightLogs[weightLogs.length - 1].weight}</Text>
                  <Text style={styles.weightUnit}>{weightLogs[0].unit}</Text>
                  <Text style={styles.weightLabel}>Current</Text>
                </View>
                <Ionicons
                  name={weightChange !== null && parseFloat(weightChange) < 0 ? 'trending-down' : 'trending-up'}
                  size={32}
                  color={weightChange !== null && parseFloat(weightChange) < 0 ? COLORS.accentGreen : COLORS.accentRed}
                />
                <View style={styles.weightStat}>
                  <Text style={[styles.weightValue, { color: weightChange !== null && parseFloat(weightChange) < 0 ? COLORS.accentGreen : COLORS.accentRed }]}>
                    {weightChange !== null ? `${parseFloat(weightChange) > 0 ? '+' : ''}${weightChange}` : '--'}
                  </Text>
                  <Text style={styles.weightUnit}>{weightLogs[0].unit}</Text>
                  <Text style={styles.weightLabel}>Total Change</Text>
                </View>
              </View>
            </GlassCard>
          </>
        )}

        {/* Top symptoms */}
        {topSymptoms.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>SYMPTOM FREQUENCY</Text>
            <GlassCard>
              {topSymptoms.map(([symptom, count], i) => (
                <View key={symptom} style={[styles.symptomRow, i > 0 && styles.symptomBorder]}>
                  <Text style={styles.symptomName}>{symptom}</Text>
                  <View style={styles.symptomBarBg}>
                    <LinearGradient
                      colors={[COLORS.accentRed, COLORS.accentRed + '44'] as [string, string]}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={[styles.symptomBar, { width: `${(count / topSymptoms[0][1]) * 100}%` as any }]}
                    />
                  </View>
                  <Text style={styles.symptomCount}>{count}x</Text>
                </View>
              ))}
            </GlassCard>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingTop: 60, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  title: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '800' },
  scroll: { paddingHorizontal: SPACING.md },
  overviewCard: { marginBottom: 16 },
  cardTitle: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  ringsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  ringItem: {},
  sectionLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8, marginTop: 8 },
  wellbeingRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  wellCard: { alignItems: 'center', gap: 4 },
  wellValue: { fontSize: 22, fontWeight: '700' },
  wellLabel: { color: COLORS.textSecondary, fontSize: 11 },
  weightCard: { marginBottom: 8 },
  weightRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  weightStat: { alignItems: 'center' },
  weightValue: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '800' },
  weightUnit: { color: COLORS.textSecondary, fontSize: 12 },
  weightLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  symptomRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  symptomBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  symptomName: { color: COLORS.textPrimary, fontSize: 13, width: 100 },
  symptomBarBg: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' },
  symptomBar: { height: 4, borderRadius: 2 },
  symptomCount: { color: COLORS.textSecondary, fontSize: 12, width: 28, textAlign: 'right' },
});
