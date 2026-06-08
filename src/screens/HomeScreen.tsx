import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import ProgressRing from '../components/ProgressRing';
import { Storage } from '../store/storage';
import { WaterLog, NutritionLog, WeightLog, CheckIn, DoseLog, UserGoals } from '../types';

const DEFAULT_GOALS: UserGoals = {
  dailyWater: 2500,
  dailyCalories: 2000,
  dailyProtein: 150,
  dailyCarbs: 200,
  dailyFat: 65,
  dailyFiber: 30,
  targetWeight: 0,
  weightUnit: 'lbs',
};

export default function HomeScreen({ navigation }: any) {
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [goals, setGoals] = useState<UserGoals>(DEFAULT_GOALS);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [water, nutrition, weight, checks, doses, savedGoals] = await Promise.all([
      Storage.get<WaterLog>(Storage.KEYS.WATER_LOGS),
      Storage.get<NutritionLog>(Storage.KEYS.NUTRITION_LOGS),
      Storage.get<WeightLog>(Storage.KEYS.WEIGHT_LOGS),
      Storage.get<CheckIn>(Storage.KEYS.CHECK_INS),
      Storage.get<DoseLog>(Storage.KEYS.DOSE_LOGS),
      Storage.getOne<UserGoals>(Storage.KEYS.USER_GOALS),
    ]);
    setWaterLogs(water);
    setNutritionLogs(nutrition);
    setWeightLogs(weight);
    setCheckIns(checks);
    setDoseLogs(doses);
    if (savedGoals) setGoals(savedGoals);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const todayWater = waterLogs
    .filter(l => l.timestamp >= todayStr)
    .reduce((s, l) => s + l.amount, 0);

  const todayNutrition = nutritionLogs.filter(l => l.timestamp >= todayStr);
  const todayCalories = todayNutrition.reduce((s, l) => s + l.calories, 0);
  const todayProtein = todayNutrition.reduce((s, l) => s + l.protein, 0);

  const latestWeight = weightLogs.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  const todayCheckIn = checkIns.find(c => c.timestamp >= todayStr);
  const todayDoses = doseLogs.filter(l => l.timestamp >= todayStr);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0A0A0F', '#0F0A1A', '#0A0F0A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.appName}>PEPTIDE.AI</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.avatarBtn}>
          <LinearGradient
            colors={COLORS.gradientPrimary as [string, string]}
            style={styles.avatar}
          >
            <Ionicons name="person" size={18} color="#0A0A0F" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
      >
        {/* Today's summary */}
        <GlassCard variant="accent" style={styles.summaryCard}>
          <Text style={styles.sectionLabel}>TODAY'S PROGRESS</Text>
          <View style={styles.ringsRow}>
            <ProgressRing
              size={80} strokeWidth={7}
              progress={todayWater / goals.dailyWater}
              color={COLORS.accentAlt}
              label={`${Math.round(todayWater / 100) / 10}L`}
              sublabel="Water"
            />
            <ProgressRing
              size={80} strokeWidth={7}
              progress={todayCalories / goals.dailyCalories}
              color={COLORS.accentWarm}
              label={`${todayCalories}`}
              sublabel="kcal"
            />
            <ProgressRing
              size={80} strokeWidth={7}
              progress={todayProtein / goals.dailyProtein}
              color={COLORS.accent}
              label={`${todayProtein}g`}
              sublabel="Protein"
            />
          </View>
        </GlassCard>

        {/* Quick actions */}
        <Text style={styles.sectionLabel}>QUICK LOG</Text>
        <View style={styles.quickGrid}>
          {[
            { label: 'Log Water', icon: 'water', screen: 'Hydration', color: COLORS.accentAlt },
            { label: 'Log Food', icon: 'restaurant', screen: 'Nutrition', color: COLORS.accentWarm },
            { label: 'Log Dose', icon: 'medical', screen: 'DoseLog', color: COLORS.accent },
            { label: 'Check In', icon: 'heart', screen: 'CheckIn', color: COLORS.accentRed },
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.quickCard}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.75}
            >
              <View style={[styles.quickIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats row */}
        <Text style={styles.sectionLabel}>STATS</Text>
        <View style={styles.statsRow}>
          <GlassCard style={[styles.statCard, { flex: 1, marginRight: 8 }] as any}>
            <Ionicons name="scale" size={18} color={COLORS.accentBlue} />
            <Text style={styles.statValue}>
              {latestWeight ? `${latestWeight.weight}` : '--'}
            </Text>
            <Text style={styles.statLabel}>{latestWeight ? latestWeight.unit : 'Weight'}</Text>
          </GlassCard>
          <GlassCard style={[styles.statCard, { flex: 1, marginHorizontal: 4 }] as any}>
            <Ionicons name="medical" size={18} color={COLORS.accent} />
            <Text style={styles.statValue}>{todayDoses.length}</Text>
            <Text style={styles.statLabel}>Doses Today</Text>
          </GlassCard>
          <GlassCard style={[styles.statCard, { flex: 1, marginLeft: 8 }] as any}>
            <Ionicons name="sunny" size={18} color={COLORS.accentYellow} />
            <Text style={styles.statValue}>
              {todayCheckIn ? `${todayCheckIn.mood}/5` : '--'}
            </Text>
            <Text style={styles.statLabel}>Mood</Text>
          </GlassCard>
        </View>

        {/* Recent dose */}
        {todayDoses.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>RECENT DOSE</Text>
            <GlassCard>
              <View style={styles.doseRow}>
                <View style={[styles.doseDot, { backgroundColor: COLORS.accent }]} />
                <View style={styles.doseInfo}>
                  <Text style={styles.doseName}>{todayDoses[todayDoses.length - 1].peptideName}</Text>
                  <Text style={styles.doseDetail}>
                    {todayDoses[todayDoses.length - 1].dose} {todayDoses[todayDoses.length - 1].unit} · {todayDoses[todayDoses.length - 1].injectionSite}
                  </Text>
                </View>
                <Text style={styles.doseTime}>
                  {new Date(todayDoses[todayDoses.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  greeting: { color: COLORS.textSecondary, fontSize: 13, letterSpacing: 0.5 },
  appName: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 3,
  },
  avatarBtn: {},
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  scroll: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },
  summaryCard: { marginBottom: SPACING.lg },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: SPACING.md,
  },
  quickCard: {
    width: '50%',
    padding: 6,
  },
  quickCardInner: {
    backgroundColor: COLORS.bgGlass,
    borderRadius: RADIUS.md,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.bgGlassBorder,
    alignItems: 'flex-start',
  },
  quickIcon: {
    backgroundColor: COLORS.bgGlass,
    borderRadius: RADIUS.md,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.bgGlassBorder,
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 0,
  },
  quickLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    width: '100%',
  },
  statsRow: { flexDirection: 'row', marginBottom: SPACING.md },
  statCard: { alignItems: 'center', gap: 4 },
  statValue: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700' },
  statLabel: { color: COLORS.textSecondary, fontSize: 11 },
  doseRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  doseDot: { width: 10, height: 10, borderRadius: 5 },
  doseInfo: { flex: 1 },
  doseName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  doseDetail: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  doseTime: { color: COLORS.textTertiary, fontSize: 12 },
});
