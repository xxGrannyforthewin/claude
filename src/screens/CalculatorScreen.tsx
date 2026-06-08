import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import GlassCard from '../components/GlassCard';

export default function CalculatorScreen() {
  const [vialMg, setVialMg] = useState('');
  const [bacWaterMl, setBacWaterMl] = useState('');
  const [desiredDoseMcg, setDesiredDoseMcg] = useState('');

  const vialMgN = parseFloat(vialMg) || 0;
  const bacWaterMlN = parseFloat(bacWaterMl) || 0;
  const desiredDoseMcgN = parseFloat(desiredDoseMcg) || 0;

  // Concentration = mg per mL
  const concentrationMgPerMl = bacWaterMlN > 0 ? vialMgN / bacWaterMlN : 0;
  const concentrationMcgPerMl = concentrationMgPerMl * 1000;

  // For a standard insulin syringe: 100 units = 1mL
  // So 1 unit = 0.01 mL
  const mlNeeded = concentrationMcgPerMl > 0 ? desiredDoseMcgN / concentrationMcgPerMl : 0;
  const unitsNeeded = mlNeeded * 100; // insulin units

  // How many doses
  const dosesPerVial = desiredDoseMcgN > 0 && vialMgN > 0
    ? Math.floor((vialMgN * 1000) / desiredDoseMcgN)
    : 0;

  const isValid = vialMgN > 0 && bacWaterMlN > 0 && desiredDoseMcgN > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0A0F', '#0F0A18']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.title}>Calculator</Text>
        <Text style={styles.subtitle}>Reconstitution & dosing math</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassCard variant="accent" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={18} color={COLORS.accent} />
            <Text style={styles.infoText}>
              Uses a standard 100-unit insulin syringe (1mL). Results are for reference only.
            </Text>
          </View>
        </GlassCard>

        {/* Inputs */}
        <Text style={styles.sectionLabel}>VIAL DETAILS</Text>
        <GlassCard style={styles.inputCard}>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>VIAL SIZE (mg)</Text>
              <TextInput
                style={styles.input} value={vialMg} onChangeText={setVialMg}
                keyboardType="decimal-pad" placeholder="5" placeholderTextColor={COLORS.textTertiary}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>BAC WATER (mL)</Text>
              <TextInput
                style={styles.input} value={bacWaterMl} onChangeText={setBacWaterMl}
                keyboardType="decimal-pad" placeholder="1" placeholderTextColor={COLORS.textTertiary}
              />
            </View>
          </View>
        </GlassCard>

        <Text style={styles.sectionLabel}>DESIRED DOSE</Text>
        <GlassCard style={styles.inputCard}>
          <Text style={styles.inputLabel}>DOSE (mcg)</Text>
          <TextInput
            style={styles.input} value={desiredDoseMcg} onChangeText={setDesiredDoseMcg}
            keyboardType="decimal-pad" placeholder="250" placeholderTextColor={COLORS.textTertiary}
          />
        </GlassCard>

        {/* Results */}
        <Text style={styles.sectionLabel}>RESULTS</Text>
        <GlassCard style={styles.resultsCard}>
          {[
            {
              label: 'Concentration', value: isValid ? `${concentrationMcgPerMl.toFixed(0)} mcg/mL` : '--',
              sub: isValid ? `${concentrationMgPerMl.toFixed(2)} mg/mL` : null,
              color: COLORS.accent,
            },
            {
              label: 'Volume Per Dose', value: isValid ? `${mlNeeded.toFixed(3)} mL` : '--',
              sub: null, color: COLORS.accentAlt,
            },
            {
              label: 'Syringe Units', value: isValid ? `${unitsNeeded.toFixed(1)} units` : '--',
              sub: isValid ? 'on a 100-unit (1mL) syringe' : null,
              color: COLORS.accentWarm,
            },
            {
              label: 'Doses Per Vial', value: isValid ? `${dosesPerVial} doses` : '--',
              sub: null, color: COLORS.accentGreen,
            },
          ].map((result, i) => (
            <View key={result.label} style={[styles.resultRow, i > 0 && styles.resultBorder]}>
              <View style={styles.resultLeft}>
                <Text style={styles.resultLabel}>{result.label}</Text>
                {result.sub && <Text style={styles.resultSub}>{result.sub}</Text>}
              </View>
              <Text style={[styles.resultValue, { color: result.color }]}>{result.value}</Text>
            </View>
          ))}
        </GlassCard>

        {/* Visual guide */}
        <Text style={styles.sectionLabel}>SYRINGE GUIDE</Text>
        <GlassCard>
          <View style={styles.syringeContainer}>
            {/* Syringe visualization */}
            <View style={styles.syringe}>
              <View style={styles.syringeBody}>
                {isValid && (
                  <LinearGradient
                    colors={[COLORS.accent, COLORS.accentAlt] as [string, string]}
                    style={[styles.syringeFill, { height: `${Math.min(unitsNeeded, 100)}%` as any }]}
                  />
                )}
                {[100, 80, 60, 40, 20].map(mark => (
                  <View key={mark} style={[styles.syringeMark, { bottom: `${mark}%` as any }]}>
                    <Text style={styles.syringeMarkText}>{mark}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.syringeNeedle} />
            </View>
            <View style={styles.syringeInfo}>
              <Text style={styles.syringeLabel}>Draw to:</Text>
              <Text style={[styles.syringeValue, { color: COLORS.accent }]}>
                {isValid ? `${unitsNeeded.toFixed(1)} units` : '--'}
              </Text>
              <Text style={styles.syringeSubLabel}>
                {isValid ? `(${(mlNeeded * 1000).toFixed(1)} μL)` : ''}
              </Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard style={styles.disclaimerCard}>
          <View style={styles.disclaimerRow}>
            <Ionicons name="warning" size={16} color={COLORS.accentYellow} />
            <Text style={styles.disclaimerText}>
              For informational purposes only. Always verify calculations and consult a healthcare professional.
            </Text>
          </View>
        </GlassCard>

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
  infoCard: { marginBottom: 12 },
  infoRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  infoText: { color: COLORS.textSecondary, fontSize: 13, flex: 1, lineHeight: 18 },
  sectionLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8, marginTop: 8 },
  inputCard: { marginBottom: 8 },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputGroup: { flex: 1 },
  inputLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.bgGlassBorder,
    color: COLORS.textPrimary, padding: 12, fontSize: 18, fontWeight: '600',
  },
  resultsCard: { marginBottom: 12 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  resultBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  resultLeft: {},
  resultLabel: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },
  resultSub: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  resultValue: { fontSize: 18, fontWeight: '700' },
  syringeContainer: { flexDirection: 'row', alignItems: 'center', gap: 24, paddingVertical: 8 },
  syringe: { flexDirection: 'row', alignItems: 'flex-end' },
  syringeBody: {
    width: 40, height: 160, borderWidth: 1,
    borderColor: COLORS.bgGlassBorder, borderRadius: 4,
    overflow: 'hidden', justifyContent: 'flex-end', position: 'relative',
  },
  syringeFill: { width: '100%', borderRadius: 3 },
  syringeMark: {
    position: 'absolute', right: -24, width: 20,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  syringeMarkText: { color: COLORS.textTertiary, fontSize: 9, marginTop: -6, marginLeft: 4 },
  syringeNeedle: { width: 3, height: 24, backgroundColor: COLORS.bgGlassBorder, marginLeft: -1 },
  syringeInfo: { flex: 1 },
  syringeLabel: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 4 },
  syringeValue: { fontSize: 28, fontWeight: '800' },
  syringeSubLabel: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  disclaimerCard: { marginTop: 8, marginBottom: 8, backgroundColor: 'rgba(242, 217, 126, 0.05)', borderColor: COLORS.accentYellow + '33' },
  disclaimerRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  disclaimerText: { color: COLORS.accentYellow, fontSize: 12, flex: 1, lineHeight: 18, opacity: 0.8 },
});
