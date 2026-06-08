import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import PillButton from '../components/PillButton';
import { Storage } from '../store/storage';
import { Peptide } from '../types';

const VIAL_COLORS = [
  COLORS.accent, COLORS.accentAlt, COLORS.accentWarm,
  COLORS.accentRed, COLORS.accentBlue, COLORS.accentGreen, COLORS.accentYellow,
];

const TYPES = ['peptide', 'glp1'];

function AddPeptideModal({ visible, onClose, onSave }: {
  visible: boolean;
  onClose: () => void;
  onSave: (p: Partial<Peptide>) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'peptide' | 'glp1'>('peptide');
  const [vialSize, setVialSize] = useState('');
  const [concentration, setConcentration] = useState('');
  const [waterAdded, setWaterAdded] = useState('');
  const [color, setColor] = useState(VIAL_COLORS[0]);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Name required'); return; }
    onSave({
      name: name.trim(),
      type,
      vialSize: parseFloat(vialSize) || 0,
      concentration: parseFloat(concentration) || 0,
      waterAdded: parseFloat(waterAdded) || 0,
      currentAmount: parseFloat(vialSize) || 0,
      color,
      notes,
    });
    setName(''); setVialSize(''); setConcentration(''); setWaterAdded(''); setNotes('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <LinearGradient colors={['#0F0A1A', '#0A0A0F']} style={StyleSheet.absoluteFill} />
          <Text style={modalStyles.title}>Add Peptide / GLP-1</Text>

          <Text style={modalStyles.label}>NAME</Text>
          <TextInput style={modalStyles.input} value={name} onChangeText={setName} placeholder="e.g. BPC-157" placeholderTextColor={COLORS.textTertiary} />

          <Text style={modalStyles.label}>TYPE</Text>
          <View style={modalStyles.segRow}>
            {TYPES.map(t => (
              <TouchableOpacity
                key={t}
                style={[modalStyles.seg, type === t && modalStyles.segActive]}
                onPress={() => setType(t as any)}
              >
                <Text style={[modalStyles.segLabel, type === t && modalStyles.segLabelActive]}>
                  {t.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={modalStyles.row}>
            <View style={{ flex: 1 }}>
              <Text style={modalStyles.label}>VIAL SIZE (mg)</Text>
              <TextInput style={modalStyles.input} value={vialSize} onChangeText={setVialSize} keyboardType="numeric" placeholder="5" placeholderTextColor={COLORS.textTertiary} />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={modalStyles.label}>BAC WATER (mL)</Text>
              <TextInput style={modalStyles.input} value={waterAdded} onChangeText={setWaterAdded} keyboardType="numeric" placeholder="1" placeholderTextColor={COLORS.textTertiary} />
            </View>
          </View>

          <Text style={modalStyles.label}>COLOR</Text>
          <View style={modalStyles.colorRow}>
            {VIAL_COLORS.map(c => (
              <TouchableOpacity
                key={c}
                style={[modalStyles.colorDot, { backgroundColor: c }, color === c && modalStyles.colorDotActive]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>

          <Text style={modalStyles.label}>NOTES</Text>
          <TextInput style={[modalStyles.input, { height: 64 }]} value={notes} onChangeText={setNotes} multiline placeholder="Protocol notes..." placeholderTextColor={COLORS.textTertiary} />

          <View style={modalStyles.btnRow}>
            <PillButton label="Cancel" variant="outline" onPress={onClose} style={{ flex: 1, marginRight: 8 }} />
            <PillButton label="Save" variant="gradient" onPress={handleSave} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function InventoryScreen({ navigation }: any) {
  const [peptides, setPeptides] = useState<Peptide[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    const data = await Storage.get<Peptide>(Storage.KEYS.PEPTIDES);
    setPeptides(data);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async (partial: Partial<Peptide>) => {
    const newPeptide: Peptide = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...partial,
    } as Peptide;
    const updated = [...peptides, newPeptide];
    await Storage.set(Storage.KEYS.PEPTIDES, updated);
    setPeptides(updated);
    setShowAdd(false);
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Remove Peptide', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          const updated = peptides.filter(p => p.id !== id);
          await Storage.set(Storage.KEYS.PEPTIDES, updated);
          setPeptides(updated);
        }
      },
    ]);
  };

  const percentRemaining = (p: Peptide) =>
    p.vialSize > 0 ? Math.round((p.currentAmount / p.vialSize) * 100) : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0A0F', '#0A0F15']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={24} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {peptides.length === 0 && (
          <GlassCard variant="accent" style={styles.emptyCard}>
            <Ionicons name="flask" size={40} color={COLORS.accent} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={styles.emptyText}>No peptides yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first vial</Text>
          </GlassCard>
        )}

        {peptides.map(p => (
          <TouchableOpacity
            key={p.id}
            onPress={() => navigation.navigate('PeptideDetail', { peptide: p })}
            onLongPress={() => handleDelete(p.id)}
            activeOpacity={0.8}
          >
            <GlassCard style={styles.peptideCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.vialIcon, { backgroundColor: p.color + '22', borderColor: p.color + '44' }]}>
                  <Ionicons name="flask" size={20} color={p.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.peptideName}>{p.name}</Text>
                  <Text style={styles.peptideType}>{p.type.toUpperCase()}</Text>
                </View>
                <View style={styles.percentBadge}>
                  <Text style={[styles.percentText, { color: p.color }]}>{percentRemaining(p)}%</Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={styles.barBg}>
                <LinearGradient
                  colors={[p.color, p.color + '88'] as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: `${percentRemaining(p)}%` as any }]}
                />
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{p.currentAmount.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>mg left</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{p.vialSize}</Text>
                  <Text style={styles.statLabel}>mg total</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{p.waterAdded || '--'}</Text>
                  <Text style={styles.statLabel}>mL water</Text>
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>

      <AddPeptideModal visible={showAdd} onClose={() => setShowAdd(false)} onSave={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 60, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md,
  },
  title: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.bgGlass, borderWidth: 1,
    borderColor: COLORS.bgGlassBorder, justifyContent: 'center', alignItems: 'center',
  },
  scroll: { paddingHorizontal: SPACING.md },
  emptyCard: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptySubtext: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 4 },
  peptideCard: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  vialIcon: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  peptideName: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700' },
  peptideType: { color: COLORS.textSecondary, fontSize: 11, letterSpacing: 1, marginTop: 2 },
  percentBadge: {
    backgroundColor: COLORS.bgGlass,
    borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 4,
  },
  percentText: { fontSize: 14, fontWeight: '700' },
  barBg: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2, marginBottom: 12, overflow: 'hidden',
  },
  barFill: { height: 4, borderRadius: 2 },
  statsRow: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
  statLabel: { color: COLORS.textSecondary, fontSize: 10, marginTop: 2 },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg, paddingBottom: 40,
    overflow: 'hidden',
    borderWidth: 1, borderBottomWidth: 0, borderColor: COLORS.bgGlassBorder,
  },
  title: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 20 },
  label: { color: COLORS.textSecondary, fontSize: 11, letterSpacing: 1.2, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: COLORS.bgGlass, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.bgGlassBorder,
    color: COLORS.textPrimary, padding: 12, fontSize: 15,
  },
  row: { flexDirection: 'row' },
  segRow: { flexDirection: 'row', gap: 8 },
  seg: {
    flex: 1, height: 36, borderRadius: 8, borderWidth: 1,
    borderColor: COLORS.bgGlassBorder, justifyContent: 'center', alignItems: 'center',
  },
  segActive: { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent },
  segLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  segLabelActive: { color: COLORS.accent },
  colorRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  colorDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderColor: COLORS.textPrimary },
  btnRow: { flexDirection: 'row', marginTop: 20 },
});
