import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Polyline, Line } from 'react-native-svg';
import { COLORS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import PillButton from '../components/PillButton';
import { Storage } from '../store/storage';
import { WeightLog, UserGoals } from '../types';

function AddWeightModal({ visible, onClose, onSave, unit }: {
  visible: boolean; onClose: () => void;
  onSave: (log: Partial<WeightLog>) => void;
  unit: 'lbs' | 'kg';
}) {
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    onSave({ weight: parseFloat(weight) || 0, unit, notes });
    setWeight(''); setNotes('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <Text style={modalStyles.title}>Log Weight</Text>
          <Text style={modalStyles.label}>WEIGHT ({unit})</Text>
          <TextInput
            style={modalStyles.input} value={weight} onChangeText={setWeight}
            keyboardType="decimal-pad" placeholder="0.0" placeholderTextColor={COLORS.textTertiary}
          />
          <Text style={modalStyles.label}>NOTES</Text>
          <TextInput
            style={modalStyles.input} value={notes} onChangeText={setNotes}
            placeholder="Optional..." placeholderTextColor={COLORS.textTertiary}
          />
          <View style={modalStyles.btnRow}>
            <PillButton label="Cancel" variant="outline" onPress={onClose} style={{ flex: 1, marginRight: 8 }} />
            <PillButton label="Save" variant="gradient" onPress={handleSave} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function WeightScreen({ navigation }: any) {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    const [data, savedGoals] = await Promise.all([
      Storage.get<WeightLog>(Storage.KEYS.WEIGHT_LOGS),
      Storage.getOne<UserGoals>(Storage.KEYS.USER_GOALS),
    ]);
    setLogs(data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    setGoals(savedGoals);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async (partial: Partial<WeightLog>) => {
    const entry: WeightLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...partial,
    } as WeightLog;
    const updated = [...logs, entry].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    await Storage.set(Storage.KEYS.WEIGHT_LOGS, updated);
    setLogs(updated);
    setShowAdd(false);
  };

  const unit = goals?.weightUnit || 'lbs';
  const latest = logs[logs.length - 1];
  const first = logs[0];
  const change = latest && first ? latest.weight - first.weight : null;
  const target = goals?.targetWeight;

  // Chart
  const chartW = 320;
  const chartH = 120;
  const recentLogs = logs.slice(-30);
  const weights = recentLogs.map(l => l.weight);
  const minW = Math.min(...weights) - 2;
  const maxW = Math.max(...weights) + 2;

  const points = recentLogs.map((l, i) => {
    const x = weights.length < 2 ? chartW / 2 : (i / (recentLogs.length - 1)) * (chartW - 40) + 20;
    const y = chartH - ((l.weight - minW) / (maxW - minW)) * (chartH - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Weight</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={24} color={COLORS.purple} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { flex: 1, marginRight: 8 }, SHADOW.sm]}>
            <Text style={styles.statValue}>{latest ? `${latest.weight}` : '--'}</Text>
            <Text style={styles.statLabel}>Current ({unit})</Text>
          </View>
          <View style={[styles.statCard, { flex: 1, marginHorizontal: 4 }, SHADOW.sm]}>
            <Text style={[styles.statValue, {
              color: change !== null
                ? (change < 0 ? COLORS.green : COLORS.coral)
                : COLORS.textPrimary,
            }]}>
              {change !== null ? `${change > 0 ? '+' : ''}${change.toFixed(1)}` : '--'}
            </Text>
            <Text style={styles.statLabel}>Total Change</Text>
          </View>
          <View style={[styles.statCard, { flex: 1, marginLeft: 8 }, SHADOW.sm]}>
            <Text style={styles.statValue}>{target || '--'}</Text>
            <Text style={styles.statLabel}>Goal ({unit})</Text>
          </View>
        </View>

        {/* Chart */}
        {recentLogs.length > 1 && (
          <View style={[styles.chartCard, SHADOW.sm]}>
            <Text style={styles.chartTitle}>TREND (LAST 30 DAYS)</Text>
            <Svg width="100%" height={chartH + 20} viewBox={`0 0 ${chartW} ${chartH + 20}`}>
              <Line x1={20} y1={10} x2={20} y2={chartH} stroke={COLORS.border} strokeWidth={1} />
              <Line x1={20} y1={chartH} x2={chartW - 20} y2={chartH} stroke={COLORS.border} strokeWidth={1} />
              <Polyline
                points={points}
                fill="none"
                stroke={COLORS.blue}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        )}

        {/* Log list */}
        <Text style={styles.sectionLabel}>HISTORY</Text>
        {[...logs].reverse().slice(0, 20).map(log => (
          <View key={log.id} style={[styles.logRow, SHADOW.sm]}>
            <Ionicons name="scale" size={16} color={COLORS.blue} />
            <Text style={styles.logWeight}>{log.weight} {log.unit}</Text>
            {log.notes ? <Text style={styles.logNotes}>{log.notes}</Text> : null}
            <Text style={styles.logDate}>
              {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        ))}

        {logs.length === 0 && (
          <View style={[styles.emptyCard, SHADOW.sm]}>
            <Text style={styles.emptyText}>No weight logs yet</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      <AddWeightModal visible={showAdd} onClose={() => setShowAdd(false)} onSave={handleSave} unit={unit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 60, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md,
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    ...SHADOW.sm,
  },
  title: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '800', flex: 1 },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.purpleLight,
    justifyContent: 'center', alignItems: 'center',
  },
  scroll: { paddingHorizontal: SPACING.md },
  statsRow: { flexDirection: 'row', marginBottom: 12 },
  statCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center', gap: 4,
  },
  statValue: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '700' },
  statLabel: { color: COLORS.textSecondary, fontSize: 11 },
  chartCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: 16,
  },
  chartTitle: {
    color: COLORS.textSecondary, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.2, marginBottom: 8, textTransform: 'uppercase',
  },
  sectionLabel: {
    color: COLORS.textSecondary, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.2, textTransform: 'uppercase',
    marginBottom: 8, marginTop: 8,
  },
  logRow: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 8,
  },
  logWeight: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600', flex: 1 },
  logNotes: { color: COLORS.textSecondary, fontSize: 12, flex: 2 },
  logDate: { color: COLORS.textTertiary, fontSize: 12 },
  emptyCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center',
  },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg, paddingBottom: 40,
  },
  title: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 12 },
  label: {
    color: COLORS.textSecondary, fontSize: 10, letterSpacing: 1.2,
    fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, marginTop: 10,
  },
  input: {
    backgroundColor: COLORS.bg, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.borderMid,
    color: COLORS.textPrimary, padding: 12, fontSize: 15,
  },
  btnRow: { flexDirection: 'row', marginTop: 20 },
});
