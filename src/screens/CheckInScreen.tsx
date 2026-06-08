import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import PillButton from '../components/PillButton';
import { Storage } from '../store/storage';
import { CheckIn } from '../types';

const METRICS = [
  { key: 'energy', label: 'Energy', icon: 'flash', color: COLORS.orange },
  { key: 'sleep', label: 'Sleep', icon: 'moon', color: COLORS.blue },
  { key: 'mood', label: 'Mood', icon: 'happy', color: COLORS.purple },
] as const;

const EMOJIS: Record<number, string> = { 1: '😞', 2: '😐', 3: '😊', 4: '😄', 5: '🤩' };

export default function CheckInScreen({ navigation }: any) {
  const [energy, setEnergy] = useState<1|2|3|4|5>(3);
  const [sleep, setSleep] = useState<1|2|3|4|5>(3);
  const [mood, setMood] = useState<1|2|3|4|5>(3);
  const [notes, setNotes] = useState('');
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const data = await Storage.get<CheckIn>(Storage.KEYS.CHECK_INS);
    setCheckIns(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    const entry: CheckIn = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      energy, sleep, mood, notes,
    };
    const updated = [entry, ...checkIns];
    await Storage.set(Storage.KEYS.CHECK_INS, updated);
    setCheckIns(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setNotes('');
  };

  const RatingSelector = ({ value, onChange, color }: { value: number; onChange: (v: any) => void; color: string }) => (
    <View style={styles.ratingRow}>
      {[1,2,3,4,5].map(n => (
        <TouchableOpacity
          key={n}
          style={[styles.ratingBtn, value === n && { backgroundColor: color + '22', borderColor: color }]}
          onPress={() => onChange(n)}
        >
          <Text style={[styles.ratingLabel, value === n && { color }]}>{n}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Daily Check-In</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Overall emoji */}
        <View style={[styles.emojiCard, SHADOW.sm]}>
          <Text style={styles.bigEmoji}>{EMOJIS[mood]}</Text>
          <Text style={styles.emojiCaption}>How are you feeling?</Text>
        </View>

        {/* Metrics */}
        {METRICS.map(metric => {
          const val = metric.key === 'energy' ? energy : metric.key === 'sleep' ? sleep : mood;
          const setter = metric.key === 'energy' ? setEnergy : metric.key === 'sleep' ? setSleep : setMood;
          return (
            <View key={metric.key} style={[styles.metricCard, SHADOW.sm]}>
              <View style={styles.metricHeader}>
                <Ionicons name={metric.icon as any} size={20} color={metric.color} />
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={[styles.metricValue, { color: metric.color }]}>{val}/5</Text>
              </View>
              <RatingSelector value={val} onChange={setter} color={metric.color} />
            </View>
          );
        })}

        {/* Notes */}
        <View style={[styles.notesCard, SHADOW.sm]}>
          <Text style={styles.notesLabel}>NOTES</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="How was your day? Any symptoms to note?"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>

        <PillButton
          label={saved ? '✓ Saved!' : 'Save Check-In'}
          variant="gradient"
          size="lg"
          onPress={handleSave}
          colors={saved ? [COLORS.green, COLORS.blue] : undefined}
        />

        {/* History */}
        {checkIns.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>RECENT CHECK-INS</Text>
            {checkIns.slice(0, 7).map(c => (
              <View key={c.id} style={[styles.historyCard, SHADOW.sm]}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyEmoji}>{EMOJIS[c.mood]}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(c.timestamp).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.historyMetrics}>
                  {[
                    { label: 'Energy', val: c.energy, color: COLORS.orange },
                    { label: 'Sleep', val: c.sleep, color: COLORS.blue },
                    { label: 'Mood', val: c.mood, color: COLORS.purple },
                  ].map(m => (
                    <View key={m.label} style={styles.historyMetric}>
                      <Text style={[styles.historyMetricVal, { color: m.color }]}>{m.val}/5</Text>
                      <Text style={styles.historyMetricLabel}>{m.label}</Text>
                    </View>
                  ))}
                </View>
                {c.notes ? <Text style={styles.historyNotes}>{c.notes}</Text> : null}
              </View>
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
  title: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800' },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  scroll: { paddingHorizontal: SPACING.md },
  emojiCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center', marginBottom: 12,
  },
  bigEmoji: { fontSize: 60 },
  emojiCaption: { color: COLORS.textSecondary, fontSize: 14, marginTop: 8 },
  metricCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: 10,
  },
  metricHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  metricLabel: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600', flex: 1 },
  metricValue: { fontSize: 16, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', gap: 8 },
  ratingBtn: {
    flex: 1, height: 44, borderRadius: RADIUS.md,
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.borderMid,
    justifyContent: 'center', alignItems: 'center',
  },
  ratingLabel: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
  notesCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: 16,
  },
  notesLabel: {
    color: COLORS.textSecondary, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8,
  },
  notesInput: {
    color: COLORS.textPrimary, fontSize: 14, minHeight: 80,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    color: COLORS.textSecondary, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.2, textTransform: 'uppercase',
    marginBottom: 8, marginTop: 16,
  },
  historyCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: 8,
  },
  historyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  historyEmoji: { fontSize: 24 },
  historyDate: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', flex: 1 },
  historyMetrics: { flexDirection: 'row', gap: 16 },
  historyMetric: { alignItems: 'center' },
  historyMetricVal: { fontSize: 16, fontWeight: '700' },
  historyMetricLabel: { color: COLORS.textSecondary, fontSize: 10 },
  historyNotes: { color: COLORS.textSecondary, fontSize: 13, marginTop: 8 },
});
