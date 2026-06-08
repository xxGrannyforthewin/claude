import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import PillButton from '../components/PillButton';
import { Storage } from '../store/storage';
import { DoseLog, Peptide } from '../types';

const INJECTION_SITES = [
  'Abdomen L', 'Abdomen R', 'Thigh L', 'Thigh R',
  'Deltoid L', 'Deltoid R', 'Glute L', 'Glute R',
];

const UNITS = ['mcg', 'mg', 'units'];

function AddDoseModal({ visible, onClose, onSave, peptides }: {
  visible: boolean;
  onClose: () => void;
  onSave: (log: Partial<DoseLog>) => void;
  peptides: Peptide[];
}) {
  const [selectedPeptide, setSelectedPeptide] = useState<Peptide | null>(null);
  const [dose, setDose] = useState('');
  const [unit, setUnit] = useState<'mcg' | 'mg' | 'units'>('mcg');
  const [site, setSite] = useState(INJECTION_SITES[0]);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!selectedPeptide) { Alert.alert('Select a peptide'); return; }
    onSave({
      peptideId: selectedPeptide.id,
      peptideName: selectedPeptide.name,
      dose: parseFloat(dose) || 0,
      unit,
      injectionSite: site,
      notes,
      sideEffects: [],
    });
    setDose(''); setNotes('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <ScrollView>
          <View style={modalStyles.sheet}>
            <LinearGradient colors={['#0F0A1A', '#0A0A0F']} style={StyleSheet.absoluteFill} />
            <Text style={modalStyles.title}>Log Dose</Text>

            <Text style={modalStyles.label}>PEPTIDE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
              <View style={modalStyles.chipRow}>
                {peptides.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[modalStyles.chip, selectedPeptide?.id === p.id && { backgroundColor: p.color + '33', borderColor: p.color }]}
                    onPress={() => setSelectedPeptide(p)}
                  >
                    <Text style={[modalStyles.chipText, selectedPeptide?.id === p.id && { color: p.color }]}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={modalStyles.row}>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>DOSE</Text>
                <TextInput
                  style={modalStyles.input} value={dose} onChangeText={setDose}
                  keyboardType="numeric" placeholder="250" placeholderTextColor={COLORS.textTertiary}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>UNIT</Text>
                <View style={modalStyles.segRow}>
                  {UNITS.map(u => (
                    <TouchableOpacity
                      key={u}
                      style={[modalStyles.seg, unit === u && modalStyles.segActive]}
                      onPress={() => setUnit(u as any)}
                    >
                      <Text style={[modalStyles.segText, unit === u && { color: COLORS.accent }]}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Text style={modalStyles.label}>INJECTION SITE</Text>
            <View style={modalStyles.siteGrid}>
              {INJECTION_SITES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[modalStyles.siteBtn, site === s && modalStyles.siteBtnActive]}
                  onPress={() => setSite(s)}
                >
                  <Text style={[modalStyles.siteBtnText, site === s && { color: COLORS.accent }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={modalStyles.label}>NOTES</Text>
            <TextInput
              style={[modalStyles.input, { height: 64 }]} value={notes}
              onChangeText={setNotes} multiline placeholder="Optional notes..."
              placeholderTextColor={COLORS.textTertiary}
            />

            <View style={modalStyles.btnRow}>
              <PillButton label="Cancel" variant="outline" onPress={onClose} style={{ flex: 1, marginRight: 8 }} />
              <PillButton label="Log Dose" variant="gradient" onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function DoseLogScreen() {
  const [logs, setLogs] = useState<DoseLog[]>([]);
  const [peptides, setPeptides] = useState<Peptide[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    const [doseLogs, peps] = await Promise.all([
      Storage.get<DoseLog>(Storage.KEYS.DOSE_LOGS),
      Storage.get<Peptide>(Storage.KEYS.PEPTIDES),
    ]);
    setLogs(doseLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    setPeptides(peps);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async (partial: Partial<DoseLog>) => {
    const entry: DoseLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...partial,
    } as DoseLog;
    const updated = [entry, ...logs];
    await Storage.set(Storage.KEYS.DOSE_LOGS, updated);
    setLogs(updated);
    setShowAdd(false);
  };

  const getPeptide = (id: string) => peptides.find(p => p.id === id);

  const groupByDate = (items: DoseLog[]) => {
    const groups: Record<string, DoseLog[]> = {};
    items.forEach(item => {
      const date = new Date(item.timestamp).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return groups;
  };

  const grouped = groupByDate(logs);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0A0F', '#0F0A18']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.title}>Dose Log</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={24} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {logs.length === 0 && (
          <GlassCard variant="accent" style={styles.emptyCard}>
            <Ionicons name="medical" size={40} color={COLORS.accent} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={styles.emptyText}>No doses logged</Text>
            <Text style={styles.emptySubtext}>Tap + to log your first dose</Text>
          </GlassCard>
        )}

        {Object.entries(grouped).map(([date, items]) => (
          <View key={date}>
            <Text style={styles.dateHeader}>{date}</Text>
            {items.map(log => {
              const peptide = getPeptide(log.peptideId);
              const color = peptide?.color || COLORS.accent;
              return (
                <GlassCard key={log.id} style={styles.logCard}>
                  <View style={styles.logHeader}>
                    <View style={[styles.dot, { backgroundColor: color }]} />
                    <Text style={styles.logName}>{log.peptideName}</Text>
                    <Text style={styles.logTime}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.logDetails}>
                    <View style={styles.badge}>
                      <Text style={[styles.badgeText, { color }]}>{log.dose} {log.unit}</Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{log.injectionSite}</Text>
                    </View>
                  </View>
                  {log.notes ? <Text style={styles.logNotes}>{log.notes}</Text> : null}
                </GlassCard>
              );
            })}
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>

      <AddDoseModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleSave}
        peptides={peptides}
      />
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
  emptyCard: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptySubtext: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 4 },
  dateHeader: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 16, marginBottom: 8 },
  logCard: { marginBottom: 8 },
  logHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  logName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', flex: 1 },
  logTime: { color: COLORS.textSecondary, fontSize: 12 },
  logDetails: { flexDirection: 'row', gap: 8 },
  badge: {
    backgroundColor: COLORS.bgGlass, borderRadius: RADIUS.sm,
    paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.border,
  },
  badgeText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  logNotes: { color: COLORS.textTertiary, fontSize: 12, marginTop: 6 },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: {
    marginTop: 100,
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg, paddingBottom: 40, overflow: 'hidden', minHeight: 600,
    borderWidth: 1, borderBottomWidth: 0, borderColor: COLORS.bgGlassBorder,
  },
  title: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 12 },
  label: { color: COLORS.textSecondary, fontSize: 11, letterSpacing: 1.2, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: COLORS.bgGlass, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.bgGlassBorder,
    color: COLORS.textPrimary, padding: 12, fontSize: 15,
  },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.pill,
    backgroundColor: COLORS.bgGlass, borderWidth: 1, borderColor: COLORS.bgGlassBorder,
  },
  chipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  row: { flexDirection: 'row' },
  segRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  seg: {
    flex: 1, height: 40, borderRadius: 8, borderWidth: 1,
    borderColor: COLORS.bgGlassBorder, justifyContent: 'center', alignItems: 'center',
  },
  segActive: { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent },
  segText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  siteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  siteBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgGlass, borderWidth: 1, borderColor: COLORS.bgGlassBorder,
  },
  siteBtnActive: { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent },
  siteBtnText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  btnRow: { flexDirection: 'row', marginTop: 20 },
});
