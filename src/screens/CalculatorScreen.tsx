import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, StatusBar, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOW } from '../constants/theme';

export default function CalculatorScreen({ navigation }: any) {
  const [vialMg, setVialMg] = useState('');
  const [bacWaterMl, setBacWaterMl] = useState('');
  const [desiredDoseMcg, setDesiredDoseMcg] = useState('');

  const vialMgN = parseFloat(vialMg) || 0;
  const bacWaterMlN = parseFloat(bacWaterMl) || 0;
  const desiredDoseMcgN = parseFloat(desiredDoseMcg) || 0;

  const concentrationMgPerMl = bacWaterMlN > 0 ? vialMgN / bacWaterMlN : 0;
  const concentrationMcgPerMl = concentrationMgPerMl * 1000;
  const mlNeeded = concentrationMcgPerMl > 0 ? desiredDoseMcgN / concentrationMcgPerMl : 0;
  const unitsNeeded = mlNeeded * 100;
  const dosesPerVial = desiredDoseMcgN > 0 && vialMgN > 0 ? Math.floor((vialMgN * 1000) / desiredDoseMcgN) : 0;
  const isValid = vialMgN > 0 && bacWaterMlN > 0 && desiredDoseMcgN > 0;

  const results = [
    { label: 'Concentration', value: isValid ? `${concentrationMcgPerMl.toFixed(0)} mcg/mL` : '--', sub: isValid ? `${concentrationMgPerMl.toFixed(2)} mg/mL` : null, color: COLORS.purple },
    { label: 'Volume Per Dose', value: isValid ? `${mlNeeded.toFixed(3)} mL` : '--', sub: null, color: COLORS.blue },
    { label: 'Syringe Units', value: isValid ? `${unitsNeeded.toFixed(1)} units` : '--', sub: isValid ? '100-unit insulin syringe' : null, color: COLORS.orange },
    { label: 'Doses Per Vial', value: isValid ? `${dosesPerVial} doses` : '--', sub: null, color: COLORS.green },
  ];

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.title}>Calculator</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Info banner */}
        <View style={[s.infoBanner, SHADOW.soft]}>
          <Ionicons name="information-circle" size={18} color={COLORS.purple} />
          <Text style={s.infoText}>Uses a 100-unit insulin syringe (1mL). Results are for reference only.</Text>
        </View>

        {/* Inputs */}
        <Text style={s.sectionLabel}>VIAL DETAILS</Text>
        <View style={[s.card, SHADOW.sm]}>
          <View style={s.inputRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.inputLabel}>VIAL SIZE (mg)</Text>
              <TextInput style={s.input} value={vialMg} onChangeText={setVialMg} keyboardType="decimal-pad" placeholder="5" placeholderTextColor={COLORS.textTertiary} />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={s.inputLabel}>BAC WATER (mL)</Text>
              <TextInput style={s.input} value={bacWaterMl} onChangeText={setBacWaterMl} keyboardType="decimal-pad" placeholder="1" placeholderTextColor={COLORS.textTertiary} />
            </View>
          </View>
        </View>

        <Text style={s.sectionLabel}>DESIRED DOSE</Text>
        <View style={[s.card, SHADOW.sm]}>
          <Text style={s.inputLabel}>DOSE (mcg)</Text>
          <TextInput style={s.input} value={desiredDoseMcg} onChangeText={setDesiredDoseMcg} keyboardType="decimal-pad" placeholder="250" placeholderTextColor={COLORS.textTertiary} />
        </View>

        {/* Results */}
        <Text style={s.sectionLabel}>RESULTS</Text>
        <View style={[s.card, SHADOW.sm]}>
          {results.map((r, i) => (
            <View key={r.label} style={[s.resultRow, i > 0 && s.resultBorder]}>
              <View>
                <Text style={s.resultLabel}>{r.label}</Text>
                {r.sub && <Text style={s.resultSub}>{r.sub}</Text>}
              </View>
              <Text style={[s.resultValue, { color: r.color }]}>{r.value}</Text>
            </View>
          ))}
        </View>

        {/* Syringe visual */}
        <Text style={s.sectionLabel}>SYRINGE GUIDE</Text>
        <View style={[s.card, SHADOW.sm]}>
          <View style={s.syringeRow}>
            <View style={s.syringeWrap}>
              <View style={s.syringeBody}>
                {isValid && (
                  <LinearGradient
                    colors={COLORS.gradientPurple as [string, string]}
                    style={[s.syringeFill, { height: `${Math.min(unitsNeeded, 100)}%` as any }]}
                  />
                )}
                {[100, 80, 60, 40, 20].map(mark => (
                  <View key={mark} style={[s.mark, { bottom: `${mark}%` as any }]}>
                    <Text style={s.markText}>{mark}</Text>
                  </View>
                ))}
              </View>
              <View style={s.needle} />
            </View>
            <View style={s.syringeInfo}>
              <Text style={s.syringeEyebrow}>DRAW TO</Text>
              <Text style={[s.syringeVal, { color: COLORS.purple }]}>
                {isValid ? `${unitsNeeded.toFixed(1)}` : '--'}
              </Text>
              <Text style={s.syringeUnit}>units</Text>
              {isValid && <Text style={s.syringeSub}>{(mlNeeded * 1000).toFixed(1)} μL</Text>}
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={[s.disclaimer, SHADOW.soft]}>
          <Ionicons name="warning" size={16} color={COLORS.gold} />
          <Text style={s.disclaimerText}>
            For informational purposes only. Always verify calculations with a healthcare professional.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', ...SHADOW.sm },
  title: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '800', flex: 1 },
  scroll: { paddingHorizontal: SPACING.md },
  infoBanner: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: COLORS.purpleLight, borderRadius: RADIUS.md, padding: 12, marginBottom: 16 },
  infoText: { color: COLORS.purple, fontSize: 13, flex: 1, lineHeight: 18 },
  sectionLabel: {
    color: COLORS.textSecondary, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, marginTop: 8,
  },
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 16, marginBottom: 16 },
  inputRow: { flexDirection: 'row' },
  inputLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: COLORS.bg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.borderMid, color: COLORS.textPrimary, padding: 12, fontSize: 20, fontWeight: '700' },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  resultBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  resultLabel: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '500' },
  resultSub: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  resultValue: { fontSize: 18, fontWeight: '800' },
  syringeRow: { flexDirection: 'row', alignItems: 'center', gap: 32, paddingVertical: 8 },
  syringeWrap: { flexDirection: 'row', alignItems: 'flex-end' },
  syringeBody: { width: 36, height: 150, borderWidth: 1.5, borderColor: COLORS.borderMid, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end', position: 'relative', backgroundColor: COLORS.bg },
  syringeFill: { width: '100%' },
  mark: { position: 'absolute', right: -28, width: 24, borderTopWidth: 1, borderTopColor: COLORS.border },
  markText: { color: COLORS.textTertiary, fontSize: 9, marginTop: -6, marginLeft: 2 },
  needle: { width: 3, height: 22, backgroundColor: COLORS.borderMid, marginLeft: -1.5 },
  syringeInfo: { flex: 1 },
  syringeEyebrow: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  syringeVal: { fontSize: 42, fontWeight: '900', letterSpacing: -2 },
  syringeUnit: { color: COLORS.textSecondary, fontSize: 14, marginTop: -4 },
  syringeSub: { color: COLORS.textTertiary, fontSize: 12, marginTop: 4 },
  disclaimer: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: COLORS.goldLight, borderRadius: RADIUS.md, padding: 12, marginBottom: 8 },
  disclaimerText: { color: '#92400E', fontSize: 12, flex: 1, lineHeight: 18 },
});
