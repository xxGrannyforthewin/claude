import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import ProgressRing from '../components/ProgressRing';
import { Storage } from '../store/storage';
import { WaterLog, UserGoals } from '../types';

const QUICK = [150, 250, 355, 500, 750];

export default function HydrationScreen({ navigation }: any) {
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [goal, setGoal] = useState(2500);

  const load = useCallback(async () => {
    const [data, savedGoals] = await Promise.all([
      Storage.get<WaterLog>(Storage.KEYS.WATER_LOGS),
      Storage.getOne<UserGoals>(Storage.KEYS.USER_GOALS),
    ]);
    setLogs(data);
    if (savedGoals?.dailyWater) setGoal(savedGoals.dailyWater);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayLogs = logs.filter(l => new Date(l.timestamp) >= today).reverse();
  const total = todayLogs.reduce((s, l) => s + l.amount, 0);

  const weekTotals = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0);
    const end = new Date(d); end.setHours(23, 59, 59, 999);
    return {
      day: d.toLocaleDateString([], { weekday: 'short' }),
      total: logs.filter(l => { const t = new Date(l.timestamp); return t >= d && t <= end; }).reduce((s, l) => s + l.amount, 0),
    };
  });

  const logWater = async (amount: number) => {
    const entry: WaterLog = { id: Date.now().toString(), amount, timestamp: new Date().toISOString() };
    const updated = [...logs, entry];
    await Storage.set(Storage.KEYS.WATER_LOGS, updated);
    setLogs(updated);
  };

  const maxWeek = Math.max(...weekTotals.map(w => w.total), goal);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Hydration</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Main ring */}
        <View style={[styles.ringCard, SHADOW.md]}>
          <LinearGradient colors={['#60A5FA', '#93C5FD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ringGradient}>
            <ProgressRing
              size={160} strokeWidth={14}
              progress={total / goal}
              gradientColors={['#fff', '#E0F0FF']}
              bgColor="rgba(255,255,255,0.25)"
              label={`${(total / 1000).toFixed(1)}`}
              sublabel={`of ${(goal / 1000).toFixed(1)}L`}
            />
            <Text style={styles.ringStatus}>{total >= goal ? '🎯 Goal reached!' : `${goal - total}ml to go`}</Text>
          </LinearGradient>
        </View>

        {/* Quick add */}
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.quickRow}>
          {QUICK.map(a => (
            <TouchableOpacity key={a} style={[styles.quickBtn, SHADOW.soft]} onPress={() => logWater(a)} activeOpacity={0.8}>
              <Ionicons name="water" size={14} color={COLORS.blue} />
              <Text style={styles.quickText}>{a}ml</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly chart */}
        <Text style={styles.sectionTitle}>This Week</Text>
        <GlassCard style={styles.chartCard}>
          <View style={styles.chartRow}>
            {weekTotals.map((w, i) => (
              <View key={i} style={styles.chartCol}>
                <View style={styles.barContainer}>
                  <LinearGradient
                    colors={['#60A5FA', '#BFDBFE']}
                    style={[styles.chartBar, { height: `${Math.max((w.total / maxWeek) * 100, 4)}%` as any }]}
                  />
                </View>
                <Text style={styles.chartDay}>{w.day}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Log */}
        {todayLogs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Today</Text>
            {todayLogs.slice(0, 8).map(log => (
              <View key={log.id} style={[styles.logRow, SHADOW.soft]}>
                <View style={styles.logIcon}><Ionicons name="water" size={16} color={COLORS.blue} /></View>
                <Text style={styles.logAmount}>{log.amount}ml</Text>
                <Text style={styles.logTime}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            ))}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center', ...SHADOW.soft },
  title: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '800' },
  scroll: { paddingHorizontal: SPACING.md },
  ringCard: { borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: 20 },
  ringGradient: { alignItems: 'center', paddingVertical: 32 },
  ringStatus: { color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 12 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  quickBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.pill, paddingHorizontal: 14, paddingVertical: 10 },
  quickText: { color: COLORS.blue, fontSize: 13, fontWeight: '700' },
  chartCard: { marginBottom: 20 },
  chartRow: { flexDirection: 'row', height: 100, alignItems: 'flex-end', gap: 4 },
  chartCol: { flex: 1, alignItems: 'center', height: '100%' },
  barContainer: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  chartBar: { width: '100%', borderRadius: 4, minHeight: 4 },
  chartDay: { color: COLORS.textSecondary, fontSize: 10, marginTop: 4 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: 12, marginBottom: 6 },
  logIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.blueLight, justifyContent: 'center', alignItems: 'center' },
  logAmount: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600', flex: 1 },
  logTime: { color: COLORS.textSecondary, fontSize: 12 },
});
