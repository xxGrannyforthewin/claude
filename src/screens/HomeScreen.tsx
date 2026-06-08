import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import ProgressRing from '../components/ProgressRing';
import MoleculeArt from '../components/MoleculeArt';
import { Storage } from '../store/storage';
import { WaterLog, NutritionLog, WeightLog, CheckIn, DoseLog, Peptide, UserGoals } from '../types';

const W = Dimensions.get('window').width;
const CARD_GAP = 10;
const HALF = (W - SPACING.md * 2 - CARD_GAP) / 2;

const DEFAULT_GOALS: UserGoals = {
  dailyWater: 2500, dailyCalories: 2000, dailyProtein: 150,
  dailyCarbs: 200, dailyFat: 65, dailyFiber: 30,
  targetWeight: 0, weightUnit: 'lbs',
};

function timeSince(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function HomeScreen({ navigation }: any) {
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [peptides, setPeptides] = useState<Peptide[]>([]);
  const [goals, setGoals] = useState<UserGoals>(DEFAULT_GOALS);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [water, nutrition, weight, checks, doses, peps, savedGoals] = await Promise.all([
      Storage.get<WaterLog>(Storage.KEYS.WATER_LOGS),
      Storage.get<NutritionLog>(Storage.KEYS.NUTRITION_LOGS),
      Storage.get<WeightLog>(Storage.KEYS.WEIGHT_LOGS),
      Storage.get<CheckIn>(Storage.KEYS.CHECK_INS),
      Storage.get<DoseLog>(Storage.KEYS.DOSE_LOGS),
      Storage.get<Peptide>(Storage.KEYS.PEPTIDES),
      Storage.getOne<UserGoals>(Storage.KEYS.USER_GOALS),
    ]);
    setWaterLogs(water);
    setNutritionLogs(nutrition);
    setWeightLogs(weight);
    setCheckIns(checks);
    setDoseLogs(doses.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    setPeptides(peps);
    if (savedGoals) setGoals(savedGoals);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const todayWater = waterLogs.filter(l => l.timestamp >= todayStr).reduce((s, l) => s + l.amount, 0);
  const todayNutrition = nutritionLogs.filter(l => l.timestamp >= todayStr);
  const todayCal = todayNutrition.reduce((s, l) => s + l.calories, 0);
  const todayProtein = todayNutrition.reduce((s, l) => s + l.protein, 0);
  const lastDose = doseLogs[0];
  const latestWeight = [...weightLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  const todayCheckIn = checkIns.find(c => c.timestamp >= todayStr);
  const todayDoseCount = doseLogs.filter(d => d.timestamp >= todayStr).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadData(); setRefreshing(false); }} tintColor={COLORS.purple} />}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
            </Text>
            <Text style={styles.appName}>Peptide.AI</Text>
          </View>
          <View style={styles.headerRight}>
            <MoleculeArt width={130} height={72} />
          </View>
        </View>

        {/* ── Bento Grid ── */}
        <View style={styles.bento}>

          {/* Row 1: Last Dose — full width */}
          <TouchableOpacity
            style={[styles.bentoFull, styles.cardPurple, SHADOW.md]}
            onPress={() => navigation.navigate('DoseLog')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#7C5CFC', '#B09CFE']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroContent}>
                <View style={styles.heroLeft}>
                  <Text style={styles.heroEyebrow}>LAST DOSE</Text>
                  <Text style={styles.heroTitle}>
                    {lastDose ? lastDose.peptideName : 'No doses yet'}
                  </Text>
                  {lastDose && (
                    <View style={styles.heroChip}>
                      <Text style={styles.heroChipText}>{lastDose.dose} {lastDose.unit} · {lastDose.injectionSite}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.heroRight}>
                  <Text style={styles.heroTimeNum}>{lastDose ? timeSince(lastDose.timestamp) : '--'}</Text>
                  <Text style={styles.heroTimeLabel}>ago</Text>
                  <View style={styles.heroMolBubble}>
                    <Ionicons name="medical" size={20} color="rgba(255,255,255,0.7)" />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Row 2: Protein + Water */}
          <View style={styles.bentoRow}>
            {/* Protein */}
            <TouchableOpacity
              style={[styles.bentoHalf, styles.cardWhite, SHADOW.sm, { height: 170 }]}
              onPress={() => navigation.navigate('Nutrition')}
              activeOpacity={0.85}
            >
              <Text style={styles.cardLabel}>PROTEIN</Text>
              <View style={styles.ringCenter}>
                <ProgressRing
                  size={100} strokeWidth={9}
                  progress={todayProtein / goals.dailyProtein}
                  gradientColors={['#FB923C', '#FCD34D']}
                  bgColor="#FFF0E5"
                  label={`${todayProtein}`}
                  sublabel={`/ ${goals.dailyProtein}g`}
                />
              </View>
            </TouchableOpacity>

            {/* Water */}
            <TouchableOpacity
              style={[styles.bentoHalf, styles.cardWhite, SHADOW.sm, { height: 170 }]}
              onPress={() => navigation.navigate('Hydration')}
              activeOpacity={0.85}
            >
              <Text style={styles.cardLabel}>WATER</Text>
              <View style={styles.ringCenter}>
                <ProgressRing
                  size={100} strokeWidth={9}
                  progress={todayWater / goals.dailyWater}
                  gradientColors={['#60A5FA', '#93C5FD']}
                  bgColor="#EFF6FF"
                  label={`${(todayWater / 1000).toFixed(1)}`}
                  sublabel="L today"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Row 3: Calories (wide) + Mood (narrow) */}
          <View style={styles.bentoRow}>
            {/* Calories */}
            <TouchableOpacity
              style={[styles.bentoHalf, styles.cardRose, SHADOW.sm, { height: 130 }]}
              onPress={() => navigation.navigate('Nutrition')}
              activeOpacity={0.85}
            >
              <Text style={[styles.cardLabel, { color: COLORS.roseGold }]}>CALORIES</Text>
              <Text style={styles.bigNum}>{todayCal}</Text>
              <Text style={styles.bigNumSub}>of {goals.dailyCalories} kcal</Text>
              <View style={styles.thinBar}>
                <View style={[styles.thinBarFill, { width: `${Math.min((todayCal / goals.dailyCalories) * 100, 100)}%`, backgroundColor: COLORS.roseGold }]} />
              </View>
            </TouchableOpacity>

            {/* Mood */}
            <TouchableOpacity
              style={[styles.bentoHalf, styles.cardLavender, SHADOW.sm, { height: 130 }]}
              onPress={() => navigation.navigate('CheckIn')}
              activeOpacity={0.85}
            >
              <Text style={[styles.cardLabel, { color: COLORS.purple }]}>MOOD</Text>
              <Text style={styles.emojiNum}>
                {todayCheckIn ? ['😞','😐','😊','😄','🤩'][todayCheckIn.mood - 1] : '—'}
              </Text>
              <Text style={[styles.bigNumSub, { color: COLORS.purple }]}>
                {todayCheckIn ? `${todayCheckIn.mood}/5` : 'Log now'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Row 4: Weight + Doses + Peptides */}
          <View style={styles.bentoRow}>
            <TouchableOpacity style={[styles.bentoThird, styles.cardWhite, SHADOW.sm]} onPress={() => navigation.navigate('Weight')} activeOpacity={0.85}>
              <Ionicons name="scale-outline" size={18} color={COLORS.blue} />
              <Text style={styles.thirdNum}>{latestWeight?.weight ?? '--'}</Text>
              <Text style={styles.thirdLabel}>{latestWeight?.unit ?? 'lbs'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.bentoThird, styles.cardWhite, SHADOW.sm]} onPress={() => navigation.navigate('DoseLog')} activeOpacity={0.85}>
              <Ionicons name="medical-outline" size={18} color={COLORS.purple} />
              <Text style={styles.thirdNum}>{todayDoseCount}</Text>
              <Text style={styles.thirdLabel}>Doses</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.bentoThird, styles.cardWhite, SHADOW.sm]} onPress={() => navigation.navigate('Inventory')} activeOpacity={0.85}>
              <Ionicons name="flask-outline" size={18} color={COLORS.roseGold} />
              <Text style={styles.thirdNum}>{peptides.length}</Text>
              <Text style={styles.thirdLabel}>Vials</Text>
            </TouchableOpacity>
          </View>

          {/* Row 5: Peptide quick-list */}
          {peptides.length > 0 && (
            <View style={[styles.bentoFull, styles.cardWhite, SHADOW.sm]}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardSectionTitle}>Peptides</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              {peptides.slice(0, 3).map(p => {
                const pct = p.vialSize > 0 ? p.currentAmount / p.vialSize : 0;
                return (
                  <View key={p.id} style={styles.peptideItem}>
                    <View style={[styles.pepDot, { backgroundColor: p.color }]} />
                    <Text style={styles.pepName}>{p.name}</Text>
                    <View style={styles.pepBarBg}>
                      <View style={[styles.pepBarFill, { width: `${pct * 100}%`, backgroundColor: p.color }]} />
                    </View>
                    <Text style={[styles.pepPct, { color: p.color }]}>{Math.round(pct * 100)}%</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: SPACING.md },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 58, paddingBottom: 8,
  },
  headerLeft: { flex: 1 },
  greeting: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '400', letterSpacing: 0.2 },
  appName: { color: COLORS.textPrimary, fontSize: 30, fontWeight: '800', letterSpacing: -1 },
  headerRight: { marginLeft: 8 },

  bento: { gap: CARD_GAP },
  bentoFull: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  bentoRow: { flexDirection: 'row', gap: CARD_GAP },
  bentoHalf: { flex: 1, borderRadius: RADIUS.lg, padding: 14, overflow: 'hidden' },
  bentoThird: { flex: 1, borderRadius: RADIUS.lg, padding: 14, alignItems: 'center', gap: 4 },

  cardWhite: { backgroundColor: COLORS.bgCard },
  cardPurple: { backgroundColor: COLORS.purple },
  cardRose: { backgroundColor: COLORS.roseGoldLight },
  cardLavender: { backgroundColor: COLORS.lavenderLight },

  heroGradient: { padding: 20, borderRadius: RADIUS.lg },
  heroContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLeft: { flex: 1 },
  heroRight: { alignItems: 'flex-end' },
  heroEyebrow: { color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 5 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 },
  heroChip: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  heroChipText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  heroTimeNum: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  heroTimeLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: -4 },
  heroMolBubble: {
    marginTop: 10, width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center',
  },

  cardLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 2 },
  ringCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  bigNum: { color: COLORS.textPrimary, fontSize: 36, fontWeight: '900', letterSpacing: -1.5, marginTop: 6 },
  bigNumSub: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '500', marginTop: 2 },
  thinBar: { height: 3, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  thinBarFill: { height: 3, borderRadius: 2 },

  emojiNum: { fontSize: 40, marginTop: 6 },

  thirdNum: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  thirdLabel: { color: COLORS.textSecondary, fontSize: 11 },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardSectionTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  seeAll: { color: COLORS.purple, fontSize: 13, fontWeight: '600' },
  peptideItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  pepDot: { width: 8, height: 8, borderRadius: 4 },
  pepName: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600', width: 80 },
  pepBarBg: { flex: 1, height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  pepBarFill: { height: 4, borderRadius: 2 },
  pepPct: { fontSize: 12, fontWeight: '700', width: 34, textAlign: 'right' },
});
