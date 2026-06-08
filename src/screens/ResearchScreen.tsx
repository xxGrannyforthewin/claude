import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import GlassCard from '../components/GlassCard';

const COMPOUNDS = [
  {
    id: '1', name: 'BPC-157', aliases: ['Body Protection Compound'], category: 'Healing',
    halfLife: '~4 hours', peakTime: '~1-2 hours',
    summary: 'BPC-157 is a synthetic peptide derived from a protein found in gastric juice. It has been studied for its regenerative properties including tendon, ligament, and muscle repair, as well as gut health benefits.',
    tags: ['Healing', 'Gut', 'Tendon'],
    references: ['Sikiric P, et al. World J Gastroenterol. 2016.'],
  },
  {
    id: '2', name: 'TB-500', aliases: ['Thymosin Beta-4'], category: 'Recovery',
    halfLife: '~days', peakTime: '~hours',
    summary: 'TB-500 is a synthetic version of Thymosin Beta-4, a naturally occurring peptide. Research suggests roles in wound healing, angiogenesis, and reducing inflammation.',
    tags: ['Recovery', 'Inflammation', 'Angiogenesis'],
    references: ['Goldstein AL, et al. Ann N Y Acad Sci. 2012.'],
  },
  {
    id: '3', name: 'Semaglutide', aliases: ['Ozempic', 'Wegovy'], category: 'GLP-1',
    halfLife: '~1 week', peakTime: '~24-72 hours',
    summary: 'Semaglutide is a GLP-1 receptor agonist approved for type 2 diabetes and obesity. It reduces appetite, slows gastric emptying, and stimulates insulin secretion.',
    tags: ['GLP-1', 'Weight Loss', 'Diabetes'],
    references: ['Wilding JPH, et al. N Engl J Med. 2021.'],
  },
  {
    id: '4', name: 'Tirzepatide', aliases: ['Mounjaro', 'Zepbound'], category: 'GIP/GLP-1',
    halfLife: '~5 days', peakTime: '~24 hours',
    summary: 'Tirzepatide is a dual GIP and GLP-1 receptor agonist. Clinical trials show superior weight loss outcomes compared to GLP-1 monotherapy.',
    tags: ['GLP-1', 'GIP', 'Weight Loss'],
    references: ['Jastreboff AM, et al. N Engl J Med. 2022.'],
  },
  {
    id: '5', name: 'CJC-1295', aliases: ['CJC 1295', 'Drug Affinity Complex'], category: 'GHRH',
    halfLife: '~6-8 days', peakTime: '~2-4 hours',
    summary: 'CJC-1295 is a synthetic analogue of growth hormone-releasing hormone (GHRH). It stimulates GH secretion and is often combined with Ipamorelin.',
    tags: ['GH', 'GHRH', 'Anti-aging'],
    references: ['Ionescu M, et al. J Clin Endocrinol Metab. 2004.'],
  },
  {
    id: '6', name: 'Ipamorelin', aliases: ['IPA'], category: 'GHRP',
    halfLife: '~2 hours', peakTime: '~1 hour',
    summary: 'Ipamorelin is a selective growth hormone secretagogue. It stimulates GH release with minimal effect on cortisol and prolactin, making it well-tolerated.',
    tags: ['GH', 'GHRP', 'Recovery'],
    references: ['Raun K, et al. Eur J Endocrinol. 1998.'],
  },
  {
    id: '7', name: 'PT-141', aliases: ['Bremelanotide'], category: 'Sexual Health',
    halfLife: '~2.7 hours', peakTime: '~1-2 hours',
    summary: 'PT-141 is a melanocortin receptor agonist studied for sexual dysfunction in both men and women. FDA-approved as Vyleesi for HSDD in premenopausal women.',
    tags: ['Sexual Health', 'Melanocortin'],
    references: ['Clayton AH, et al. Obstet Gynecol. 2016.'],
  },
  {
    id: '8', name: 'Selank', aliases: ['TP-7'], category: 'Nootropic',
    halfLife: '~minutes (nasal)', peakTime: '~minutes',
    summary: 'Selank is a synthetic analogue of tuftsin with anxiolytic and nootropic properties. Studied for anxiety, depression, and cognitive enhancement.',
    tags: ['Nootropic', 'Anxiety', 'Cognitive'],
    references: ['Semenova TP, et al. Bull Exp Biol Med. 2010.'],
  },
  {
    id: '9', name: 'MOTS-c', aliases: ['Mitochondrial peptide'], category: 'Metabolic',
    halfLife: 'Unknown', peakTime: 'Unknown',
    summary: 'MOTS-c is a mitochondria-derived peptide that regulates metabolic homeostasis and exercise performance. Research suggests benefits for insulin sensitivity and longevity.',
    tags: ['Metabolic', 'Mitochondria', 'Longevity'],
    references: ['Lee C, et al. Cell Metab. 2015.'],
  },
  {
    id: '10', name: 'Hexarelin', aliases: ['Examorelin'], category: 'GHRP',
    halfLife: '~55 minutes', peakTime: '~30 minutes',
    summary: 'Hexarelin is a potent GH secretagogue peptide. Also studied for cardioprotective effects via GHS-R1b receptors in cardiac tissue.',
    tags: ['GH', 'Cardio', 'GHRP'],
    references: ['Ghigo E, et al. J Endocrinol Invest. 1999.'],
  },
];

const CATEGORIES = ['All', 'GLP-1', 'Healing', 'Recovery', 'GHRH', 'GHRP', 'Nootropic', 'Metabolic'];

function CompoundModal({ compound, onClose }: { compound: typeof COMPOUNDS[0] | null; onClose: () => void }) {
  if (!compound) return null;
  return (
    <Modal visible animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <LinearGradient colors={['#0F0A1A', '#0A0A0F']} style={StyleSheet.absoluteFill} />
          <View style={modalStyles.sheetHeader}>
            <View>
              <Text style={modalStyles.compoundName}>{compound.name}</Text>
              <Text style={modalStyles.compoundAlias}>{compound.aliases.join(' · ')}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={modalStyles.badgeRow}>
              {compound.tags.map(t => (
                <View key={t} style={modalStyles.badge}>
                  <Text style={modalStyles.badgeText}>{t}</Text>
                </View>
              ))}
            </View>

            <View style={modalStyles.pharmaRow}>
              <View style={modalStyles.pharmaStat}>
                <Text style={modalStyles.pharmaLabel}>HALF-LIFE</Text>
                <Text style={modalStyles.pharmaValue}>{compound.halfLife}</Text>
              </View>
              <View style={modalStyles.pharmaStat}>
                <Text style={modalStyles.pharmaLabel}>PEAK TIME</Text>
                <Text style={modalStyles.pharmaValue}>{compound.peakTime}</Text>
              </View>
            </View>

            <Text style={modalStyles.sectionLabel}>SUMMARY</Text>
            <Text style={modalStyles.summary}>{compound.summary}</Text>

            <Text style={modalStyles.sectionLabel}>REFERENCES</Text>
            {compound.references.map(r => (
              <Text key={r} style={modalStyles.reference}>• {r}</Text>
            ))}

            <View style={modalStyles.disclaimer}>
              <Ionicons name="information-circle" size={16} color={COLORS.accentYellow} />
              <Text style={modalStyles.disclaimerText}>For informational and research purposes only. Not medical advice.</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function ResearchScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<typeof COMPOUNDS[0] | null>(null);

  const filtered = COMPOUNDS.filter(c => {
    const matchCat = category === 'All' || c.category === category || c.tags.includes(category);
    const matchQuery = !query || c.name.toLowerCase().includes(query.toLowerCase())
      || c.aliases.some(a => a.toLowerCase().includes(query.toLowerCase()));
    return matchCat && matchQuery;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0A0F', '#0A0F15']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.title}>Research</Text>
        <Text style={styles.subtitle}>{COMPOUNDS.length}+ compound profiles</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search compounds..."
          placeholderTextColor={COLORS.textTertiary}
        />
      </View>

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContent}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.categoryText, category === cat && { color: COLORS.accent }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.map(compound => (
          <TouchableOpacity key={compound.id} onPress={() => setSelected(compound)} activeOpacity={0.8}>
            <GlassCard style={styles.compoundCard}>
              <View style={styles.compoundHeader}>
                <View>
                  <Text style={styles.compoundName}>{compound.name}</Text>
                  <Text style={styles.compoundAlias}>{compound.aliases[0]}</Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{compound.category}</Text>
                </View>
              </View>
              <Text style={styles.compoundSummary} numberOfLines={2}>{compound.summary}</Text>
              <View style={styles.metaRow}>
                <View style={styles.meta}>
                  <Ionicons name="time" size={12} color={COLORS.textTertiary} />
                  <Text style={styles.metaText}>t½ {compound.halfLife}</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={COLORS.textTertiary} />
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>

      <CompoundModal compound={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingTop: 60, paddingHorizontal: SPACING.md, paddingBottom: 8 },
  title: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '800' },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgGlass, borderWidth: 1, borderColor: COLORS.bgGlassBorder,
    borderRadius: RADIUS.md, marginHorizontal: SPACING.md, marginBottom: 12,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 15, height: 44 },
  categoryScroll: { maxHeight: 44, marginBottom: 4 },
  categoryContent: { paddingHorizontal: SPACING.md, gap: 8 },
  categoryChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: RADIUS.pill, backgroundColor: COLORS.bgGlass,
    borderWidth: 1, borderColor: COLORS.bgGlassBorder,
  },
  categoryChipActive: { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent },
  categoryText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  scroll: { paddingHorizontal: SPACING.md, paddingTop: 12 },
  compoundCard: { marginBottom: 10 },
  compoundHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  compoundName: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700' },
  compoundAlias: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  categoryBadge: {
    backgroundColor: COLORS.accent + '22', borderRadius: RADIUS.sm,
    paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.accent + '44',
  },
  categoryBadgeText: { color: COLORS.accent, fontSize: 11, fontWeight: '600' },
  compoundSummary: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: COLORS.textTertiary, fontSize: 12 },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: {
    height: '80%', borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg, paddingBottom: 40, overflow: 'hidden',
    borderWidth: 1, borderBottomWidth: 0, borderColor: COLORS.bgGlassBorder,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  compoundName: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800' },
  compoundAlias: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  badge: {
    backgroundColor: COLORS.bgGlass, borderRadius: RADIUS.sm,
    paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.bgGlassBorder,
  },
  badgeText: { color: COLORS.textSecondary, fontSize: 12 },
  pharmaRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  pharmaStat: {
    flex: 1, backgroundColor: COLORS.bgGlass, borderRadius: RADIUS.md,
    padding: 12, borderWidth: 1, borderColor: COLORS.bgGlassBorder,
  },
  pharmaLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  pharmaValue: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
  sectionLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8, marginTop: 12 },
  summary: { color: COLORS.textPrimary, fontSize: 14, lineHeight: 22 },
  reference: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 4 },
  disclaimer: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: COLORS.accentYellow + '11', borderRadius: RADIUS.md,
    padding: 12, marginTop: 16, borderWidth: 1, borderColor: COLORS.accentYellow + '33',
  },
  disclaimerText: { color: COLORS.accentYellow, fontSize: 12, flex: 1, lineHeight: 18 },
});
