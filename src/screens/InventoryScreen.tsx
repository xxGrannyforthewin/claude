import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import PillButton from '../components/PillButton';
import { Storage } from '../store/storage';
import { Peptide } from '../types';

const VIAL_COLORS = [COLORS.purple, COLORS.blue, COLORS.green, COLORS.orange, COLORS.coral, '#14B8A6', '#8B5CF6'];

function AddPeptideModal({ visible, onClose, onSave }: { visible: boolean; onClose: () => void; onSave: (p: Partial<Peptide>) => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'peptide' | 'glp1'>('peptide');
  const [vialSize, setVialSize] = useState('');
  const [waterAdded, setWaterAdded] = useState('');
  const [color, setColor] = useState(VIAL_COLORS[0]);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Name required'); return; }
    onSave({ name: name.trim(), type, vialSize: parseFloat(vialSize) || 0, waterAdded: parseFloat(waterAdded) || 0, currentAmount: parseFloat(vialSize) || 0, color, notes, concentration: 0 });
    setName(''); setVialSize(''); setWaterAdded(''); setNotes('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={m.overlay}>
        <View style={m.sheet}>
          <View style={m.handle} />
          <Text style={m.title}>Add Peptide / GLP-1</Text>

          <Text style={m.label}>NAME</Text>
          <TextInput style={m.input} value={name} onChangeText={setName} placeholder="e.g. BPC-157" placeholderTextColor={COLORS.textTertiary} />

          <Text style={m.label}>TYPE</Text>
          <View style={m.segRow}>
            {(['peptide', 'glp1'] as const).map(t => (
              <TouchableOpacity key={t} style={[m.seg, type === t && m.segActive]} onPress={() => setType(t)}>
                <Text style={[m.segTxt, type === t && m.segTxtActive]}>{t === 'glp1' ? 'GLP-1' : 'Peptide'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={m.row}>
            <View style={{ flex: 1 }}>
              <Text style={m.label}>VIAL SIZE (mg)</Text>
              <TextInput style={m.input} value={vialSize} onChangeText={setVialSize} keyboardType="numeric" placeholder="5" placeholderTextColor={COLORS.textTertiary} />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={m.label}>BAC WATER (mL)</Text>
              <TextInput style={m.input} value={waterAdded} onChangeText={setWaterAdded} keyboardType="numeric" placeholder="1" placeholderTextColor={COLORS.textTertiary} />
            </View>
          </View>

          <Text style={m.label}>COLOR</Text>
          <View style={m.colorRow}>
            {VIAL_COLORS.map(c => (
              <TouchableOpacity key={c} style={[m.dot, { backgroundColor: c }, color === c && m.dotActive]} onPress={() => setColor(c)} />
            ))}
          </View>

          <View style={m.btnRow}>
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
    setPeptides(await Storage.get<Peptide>(Storage.KEYS.PEPTIDES));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async (partial: Partial<Peptide>) => {
    const p: Peptide = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...partial } as Peptide;
    const updated = [...peptides, p];
    await Storage.set(Storage.KEYS.PEPTIDES, updated);
    setPeptides(updated); setShowAdd(false);
  };

  const handleRefill = async (id: string) => {
    const updated = peptides.map(p => p.id === id ? { ...p, currentAmount: p.vialSize } : p);
    await Storage.set(Storage.KEYS.PEPTIDES, updated); setPeptides(updated);
  };

  const handleDelete = (id: string) => Alert.alert('Remove', 'Remove this peptide?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: async () => {
      const updated = peptides.filter(p => p.id !== id);
      await Storage.set(Storage.KEYS.PEPTIDES, updated); setPeptides(updated);
    }},
  ]);

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <View>
          <Text style={s.title}>Inventory</Text>
          <Text style={s.subtitle}>{peptides.length} vial{peptides.length !== 1 ? 's' : ''} tracked</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAdd(true)} activeOpacity={0.85}>
          <LinearGradient colors={COLORS.gradientPurple as [string, string]} style={s.addBtn}>
            <Ionicons name="add" size={22} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {peptides.length === 0 && (
          <View style={s.empty}>
            <View style={s.emptyIcon}><Ionicons name="flask" size={36} color={COLORS.purple} /></View>
            <Text style={s.emptyTitle}>No peptides yet</Text>
            <Text style={s.emptyBody}>Add your vials to track inventory and doses</Text>
            <PillButton label="Add First Vial" variant="gradient" onPress={() => setShowAdd(true)} style={{ marginTop: 20, alignSelf: 'center' }} />
          </View>
        )}

        {peptides.map(p => {
          const pct = p.vialSize > 0 ? p.currentAmount / p.vialSize : 0;
          const pctNum = Math.round(pct * 100);
          const lowStock = pct < 0.25;
          return (
            <View key={p.id} style={[s.card, SHADOW.sm]}>
              <View style={[s.colorStripe, { backgroundColor: p.color }]} />
              <View style={s.cardBody}>
                <View style={s.cardTop}>
                  <View style={[s.vialIcon, { backgroundColor: p.color + '18' }]}>
                    <Ionicons name="flask" size={20} color={p.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={s.pepName}>{p.name}</Text>
                    <View style={s.typePill}>
                      <Text style={[s.typeText, { color: p.color }]}>{p.type === 'glp1' ? 'GLP-1' : 'Peptide'}</Text>
                    </View>
                  </View>
                  {lowStock && (
                    <View style={s.lowBadge}>
                      <Text style={s.lowText}>Low</Text>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => handleDelete(p.id)} style={s.moreBtn}>
                    <Ionicons name="trash-outline" size={16} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                </View>

                <View style={s.barBg}>
                  <View style={[s.barFill, { width: `${pctNum}%`, backgroundColor: p.color }]} />
                </View>

                <View style={s.statsRow}>
                  <View style={s.stat}>
                    <Text style={[s.statBig, { color: p.color }]}>{pctNum}%</Text>
                    <Text style={s.statSub}>Remaining</Text>
                  </View>
                  <View style={s.divider} />
                  <View style={s.stat}>
                    <Text style={s.statBig}>{p.currentAmount.toFixed(1)}</Text>
                    <Text style={s.statSub}>mg left</Text>
                  </View>
                  <View style={s.divider} />
                  <View style={s.stat}>
                    <Text style={s.statBig}>{p.vialSize}</Text>
                    <Text style={s.statSub}>mg total</Text>
                  </View>
                  <TouchableOpacity style={s.refillBtn} onPress={() => handleRefill(p.id)}>
                    <Ionicons name="refresh" size={12} color={COLORS.purple} />
                    <Text style={s.refillText}>Refill</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>

      <AddPeptideModal visible={showAdd} onClose={() => setShowAdd(false)} onSave={handleSave} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: SPACING.md, paddingBottom: 12 },
  title: { color: COLORS.textPrimary, fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  addBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: SPACING.md },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: COLORS.purpleLight, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  emptyBody: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, marginBottom: 12, flexDirection: 'row', overflow: 'hidden' },
  colorStripe: { width: 5 },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  vialIcon: { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  pepName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  typePill: { marginTop: 2 },
  typeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  lowBadge: { backgroundColor: COLORS.coralLight, borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 3, marginRight: 6 },
  lowText: { color: COLORS.coral, fontSize: 11, fontWeight: '700' },
  moreBtn: { padding: 4 },
  barBg: { height: 5, backgroundColor: COLORS.border, borderRadius: 3, marginBottom: 12, overflow: 'hidden' },
  barFill: { height: 5, borderRadius: 3 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statBig: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '800' },
  statSub: { color: COLORS.textSecondary, fontSize: 10, marginTop: 1 },
  divider: { width: 1, height: 28, backgroundColor: COLORS.border },
  refillBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.purpleLight, borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 5 },
  refillText: { color: COLORS.purple, fontSize: 12, fontWeight: '700' },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, paddingBottom: 44 },
  handle: { width: 36, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  label: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: COLORS.bg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.borderMid, color: COLORS.textPrimary, padding: 12, fontSize: 15 },
  row: { flexDirection: 'row' },
  segRow: { flexDirection: 'row', gap: 8 },
  seg: { flex: 1, height: 40, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.borderMid, justifyContent: 'center', alignItems: 'center' },
  segActive: { backgroundColor: COLORS.purpleLight, borderColor: COLORS.purple },
  segTxt: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  segTxtActive: { color: COLORS.purple },
  colorRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'transparent' },
  dotActive: { borderColor: COLORS.textPrimary },
  btnRow: { flexDirection: 'row', marginTop: 24 },
});
