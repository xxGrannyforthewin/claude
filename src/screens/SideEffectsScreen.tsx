import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import PillButton from '../components/PillButton';
import { Storage } from '../store/storage';
import { SideEffect } from '../types';

const SYMPTOMS = [
  'Nausea', 'Fatigue', 'Headache', 'Appetite Changes', 'Injection Site Reaction',
  'Dizziness', 'Flushing', 'Sweating', 'Insomnia', 'Bloating',
  'Constipation', 'Diarrhea', 'Muscle Aches', 'Joint Pain', 'Brain Fog',
  'Increased Thirst', 'Mood Changes', 'Skin Changes', 'Hair Changes', 'Other',
];

const SEVERITY_COLORS = [
  COLORS.accentGreen, COLORS.accentAlt, COLORS.accentYellow, COLORS.accentWarm, COLORS.accentRed,
];

function AddEffectModal({ visible, onClose, onSave }: {
  visible: boolean; onClose: () => void;
  onSave: (e: Partial<SideEffect>) => void;
}) {
  const [symptom, setSymptom] = useState(SYMPTOMS[0]);
  const [severity, setSeverity] = useState<1|2|3|4|5>(1);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    onSave({ symptom, severity, notes });
    setNotes('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <ScrollView>
          <View style={modalStyles.sheet}>
            <LinearGradient colors={['#0F0A1A', '#0A0A0F']} style={StyleSheet.absoluteFill} />
            <Text style={modalStyles.title}>Log Side Effect</Text>

            <Text style={modalStyles.label}>SYMPTOM</Text>
            <View style={modalStyles.symptomGrid}>
              {SYMPTOMS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[modalStyles.symptomBtn, symptom === s && modalStyles.symptomBtnActive]}
                  onPress={() => setSymptom(s)}
                >
                  <Text style={[modalStyles.symptomText, symptom === s && { color: COLORS.accent }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={modalStyles.label}>SEVERITY (1-5)</Text>
            <View style={modalStyles.severityRow}>
              {[1,2,3,4,5].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[modalStyles.severityBtn, severity === n && { backgroundColor: SEVERITY_COLORS[n-1] + '33', borderColor: SEVERITY_COLORS[n-1] }]}
                  onPress={() => setSeverity(n as any)}
                >
                  <Text style={[modalStyles.severityText, severity === n && { color: SEVERITY_COLORS[n-1] }]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={modalStyles.severityCaption}>
              {['Barely noticeable', 'Mild', 'Moderate', 'Significant', 'Severe'][severity - 1]}
            </Text>

            <Text style={modalStyles.label}>NOTES</Text>
            <TextInput
              style={[modalStyles.input, { height: 64 }]} value={notes}
              onChangeText={setNotes} multiline placeholder="Additional details..."
              placeholderTextColor={COLORS.textTertiary}
            />

            <View style={modalStyles.btnRow}>
              <PillButton label="Cancel" variant="outline" onPress={onClose} style={{ flex: 1, marginRight: 8 }} />
              <PillButton label="Log" variant="gradient" onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function SideEffectsScreen() {
  const [effects, setEffects] = useState<SideEffect[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    const data = await Storage.get<SideEffect>(Storage.KEYS.SIDE_EFFECTS);
    setEffects(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async (partial: Partial<SideEffect>) => {
    const entry: SideEffect = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...partial,
    } as SideEffect;
    const updated = [entry, ...effects];
    await Storage.set(Storage.KEYS.SIDE_EFFECTS, updated);
    setEffects(updated);
    setShowAdd(false);
  };

  const symptomFreq: Record<string, { count: number; avgSeverity: number }> = {};
  effects.forEach(e => {
    if (!symptomFreq[e.symptom]) symptomFreq[e.symptom] = { count: 0, avgSeverity: 0 };
    symptomFreq[e.symptom].count++;
    symptomFreq[e.symptom].avgSeverity += e.severity;
  });
  Object.keys(symptomFreq).forEach(k => {
    symptomFreq[k].avgSeverity = parseFloat((symptomFreq[k].avgSeverity / symptomFreq[k].count).toFixed(1));
  });
  const topSymptoms = Object.entries(symptomFreq).sort((a, b) => b[1].count - a[1].count).slice(0, 5);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0A0F', '#150A0A']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.title}>Side Effects</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={24} color={COLORS.accentRed} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Frequency summary */}
        {topSymptoms.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>SYMPTOM SUMMARY</Text>
            <GlassCard variant="accent" style={styles.summaryCard}>
              {topSymptoms.map(([symptom, data], i) => (
                <View key={symptom} style={[styles.summaryRow, i > 0 && styles.summaryBorder]}>
                  <View style={[styles.severityDot, { backgroundColor: SEVERITY_COLORS[Math.round(data.avgSeverity) - 1] }]} />
                  <Text style={styles.summarySymptom}>{symptom}</Text>
                  <Text style={styles.summaryCount}>{data.count}x</Text>
                  <Text style={[styles.summaryAvg, { color: SEVERITY_COLORS[Math.round(data.avgSeverity) - 1] }]}>
                    avg {data.avgSeverity}
                  </Text>
                </View>
              ))}
            </GlassCard>
          </>
        )}

        {/* Log */}
        <Text style={styles.sectionLabel}>LOG ({effects.length})</Text>
        {effects.length === 0 && (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>No side effects logged</Text>
          </GlassCard>
        )}
        {effects.map(e => (
          <GlassCard key={e.id} style={styles.effectCard}>
            <View style={styles.effectHeader}>
              <View style={[styles.severityBadge, { backgroundColor: SEVERITY_COLORS[e.severity - 1] + '22', borderColor: SEVERITY_COLORS[e.severity - 1] + '55' }]}>
                <Text style={[styles.severityNum, { color: SEVERITY_COLORS[e.severity - 1] }]}>{e.severity}</Text>
              </View>
              <Text style={styles.effectSymptom}>{e.symptom}</Text>
              <Text style={styles.effectTime}>
                {new Date(e.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </Text>
            </View>
            {e.notes ? <Text style={styles.effectNotes}>{e.notes}</Text> : null}
          </GlassCard>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>

      <AddEffectModal visible={showAdd} onClose={() => setShowAdd(false)} onSave={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 60, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md,
  },
  title: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '800' },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.bgGlass, borderWidth: 1,
    borderColor: COLORS.bgGlassBorder, justifyContent: 'center', alignItems: 'center',
  },
  scroll: { paddingHorizontal: SPACING.md },
  sectionLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8, marginTop: 8 },
  summaryCard: { marginBottom: 8 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  summaryBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  severityDot: { width: 8, height: 8, borderRadius: 4 },
  summarySymptom: { color: COLORS.textPrimary, fontSize: 14, flex: 1 },
  summaryCount: { color: COLORS.textSecondary, fontSize: 13 },
  summaryAvg: { fontSize: 13, fontWeight: '600', width: 44, textAlign: 'right' },
  emptyCard: { alignItems: 'center' },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
  effectCard: { marginBottom: 8 },
  effectHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  severityBadge: {
    width: 32, height: 32, borderRadius: 8,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center',
  },
  severityNum: { fontSize: 15, fontWeight: '700' },
  effectSymptom: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600', flex: 1 },
  effectTime: { color: COLORS.textSecondary, fontSize: 12 },
  effectNotes: { color: COLORS.textSecondary, fontSize: 13, marginTop: 8 },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: {
    marginTop: 80,
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg, paddingBottom: 40, overflow: 'hidden', minHeight: 600,
    borderWidth: 1, borderBottomWidth: 0, borderColor: COLORS.bgGlassBorder,
  },
  title: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 12 },
  label: { color: COLORS.textSecondary, fontSize: 11, letterSpacing: 1.2, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  symptomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  symptomBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgGlass, borderWidth: 1, borderColor: COLORS.bgGlassBorder,
  },
  symptomBtnActive: { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent },
  symptomText: { color: COLORS.textSecondary, fontSize: 13 },
  severityRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  severityBtn: {
    flex: 1, height: 44, borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgGlass, borderWidth: 1, borderColor: COLORS.bgGlassBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  severityText: { color: COLORS.textSecondary, fontSize: 18, fontWeight: '700' },
  severityCaption: { color: COLORS.textTertiary, fontSize: 12, textAlign: 'center', marginBottom: 4 },
  input: {
    backgroundColor: COLORS.bgGlass, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.bgGlassBorder,
    color: COLORS.textPrimary, padding: 12, fontSize: 15,
  },
  btnRow: { flexDirection: 'row', marginTop: 20 },
});
