import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import ProgressRing from '../components/ProgressRing';
import { Storage } from '../store/storage';
import { WaterLog, UserGoals } from '../types';

const DEFAULT_GOAL = 2500;
const QUICK_AMOUNTS = [150, 250, 355, 500, 750];

export default function HydrationScreen() {
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [goal, setGoal] = useState(DEFAULT_GOAL);

  const load = useCallback(async () => {
    const [data, savedGoals] = await Promise.all([
      Storage.get<WaterLog>(Storage.KEYS.WATER_LOGS),
      Storage.getOne<UserGoals>(Storage.KEYS.USER_GOALS),
    ]);
    setLogs(data);
    if (savedGoals?.dailyWater) setGoal(savedGoals.dailyWater);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayLogs = logs.filter(l => new Date(l.timestamp) >= today).reverse();
  const todayTotal = todayLogs.reduce((s, l) => s + l.amount, 0);
  const progress = todayTotal / goal;

  // Weekly data
  const weekTotals = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    return {
      day: d.toLocaleDateString([], { weekday: 'short' }),
      total: logs
        .filter(l => {
          const t = new Date(l.timestamp);
          return t >= d && t <= end;
        })
        .reduce((s, l) => s + l.amount, 0),
    };
  });

  const logWater = async (amount: number) => {
    const entry: WaterLog = {
      id: Date.now().toString(),
      amount,
      timestamp: new Date().toISOString(),
    };
    const updated = [...logs, entry];
    await Storage.set(Storage.KEYS.WATER_LOGS, updated);
    setLogs(updated);
  };

  const maxWeek = Math.max(...weekTotals.map(w => w.total), goal);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0A0F', '#0A0F18']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.title}>Hydration</Text>
        <Text style={styles.subtitle}>{new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Main ring */}
        <GlassCard variant="accent" style={styles.mainCard}>
          <View style={styles.ringCenter}>
            <ProgressRing
              size={160} strokeWidth={12}
              progress={progress}
              color={COLORS.accentAlt}
              label={`${(todayTotal / 1000).toFixed(1)}L`}
              sublabel={`of ${(goal / 1000).toFixed(1)}L`}
            />
          </View>
          <Text style={styles.streak}>
            {todayTotal >= goal ? '🎯 Goal reached!' : `${goal - todayTotal}ml remaining`}
          </Text>
        </GlassCard>

        {/* Quick add buttons */}
        <Text style={styles.sectionLabel}>QUICK ADD</Text>
        <View style={styles.amountGrid}>
          {QUICK_AMOUNTS.map(a => (
            <TouchableOpacity key={a} style={styles.amountBtn} onPress={() => logWater(a)} activeOpacity={0.75}>
              <LinearGradient
                colors={['rgba(142,227,212,0.15)', 'rgba(142,227,212,0.05)'] as [string, string]}
                style={styles.amountBtnInner}
              >
                <Ionicons name="water" size={16} color={COLORS.accentAlt} />
                <Text style={styles.amountText}>{a}ml</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly chart */}
        <Text style={styles.sectionLabel}>THIS WEEK</Text>
        <GlassCard>
          <View style={styles.chartRow}>
            {weekTotals.map((w, i) => (
              <View key={i} style={styles.chartCol}>
                <View style={styles.barContainer}>
                  <LinearGradient
                    colors={[COLORS.accentAlt, COLORS.accentAlt + '44'] as [string, string]}
                    style={[styles.chartBar, { height: `${Math.max((w.total / maxWeek) * 100, 4)}%` as any }]}
                  />
                </View>
                <Text style={styles.chartDay}>{w.day}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Recent logs */}
        {todayLogs.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>TODAY'S LOG</Text>
            {todayLogs.slice(0, 8).map(log => (
              <GlassCard key={log.id} style={styles.logRow}>
                <Ionicons name="water" size={16} color={COLORS.accentAlt} />
                <Text style={styles.logAmount}>{log.amount}ml</Text>
                <Text style={styles.logTime}>
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </GlassCard>
            ))}
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
  subtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  scroll: { paddingHorizontal: SPACING.md },
  mainCard: { alignItems: 'center', marginBottom: SPACING.md },
  ringCenter: { marginVertical: 16 },
  streak: { color: COLORS.accentAlt, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  sectionLabel: {
    color: COLORS.textSecondary, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.5, marginBottom: SPACING.sm, marginTop: SPACING.sm,
  },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.md },
  amountBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
  amountBtnInner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.accentAlt + '33', borderRadius: RADIUS.md,
  },
  amountText: { color: COLORS.accentAlt, fontSize: 13, fontWeight: '600' },
  chartRow: { flexDirection: 'row', height: 100, alignItems: 'flex-end', gap: 4 },
  chartCol: { flex: 1, alignItems: 'center', height: '100%' },
  barContainer: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  chartBar: { width: '100%', borderRadius: 3, minHeight: 4 },
  chartDay: { color: COLORS.textSecondary, fontSize: 10, marginTop: 4 },
  logRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 8, paddingVertical: 10,
  },
  logAmount: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600', flex: 1 },
  logTime: { color: COLORS.textSecondary, fontSize: 12 },
});
