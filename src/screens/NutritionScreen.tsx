import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import ProgressRing from '../components/ProgressRing';
import PillButton from '../components/PillButton';
import { Storage } from '../store/storage';
import { NutritionLog, UserGoals } from '../types';

const DEFAULT_GOALS: UserGoals = {
  dailyWater: 2500, dailyCalories: 2000, dailyProtein: 150,
  dailyCarbs: 200, dailyFat: 65, dailyFiber: 30,
  targetWeight: 0, weightUnit: 'lbs',
};

function AddMealModal({ visible, onClose, onSave }: {
  visible: boolean;
  onClose: () => void;
  onSave: (log: Partial<NutritionLog>) => void;
}) {
  const [meal, setMeal] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');

  const handleSave = () => {
    onSave({
      meal: meal || 'Meal',
      calories: parseInt(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      fiber: parseFloat(fiber) || 0,
    });
    setMeal(''); setCalories(''); setProtein(''); setCarbs(''); setFat(''); setFiber('');
  };

  const input = (label: string, value: string, setter: (v: string) => void) => (
    <View style={{ flex: 1 }}>
      <Text style={modalStyles.label}>{label}</Text>
      <TextInput
        style={modalStyles.input} value={value} onChangeText={setter}
        keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textTertiary}
      />
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <Text style={modalStyles.title}>Log Meal</Text>

          <Text style={modalStyles.label}>MEAL NAME</Text>
          <TextInput
            style={modalStyles.input} value={meal} onChangeText={setMeal}
            placeholder="e.g. Chicken & Rice" placeholderTextColor={COLORS.textTertiary}
          />

          <Text style={modalStyles.label}>CALORIES</Text>
          <TextInput
            style={modalStyles.input} value={calories} onChangeText={setCalories}
            keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textTertiary}
          />

          <View style={modalStyles.row}>
            {input('PROTEIN (g)', protein, setProtein)}
            <View style={{ width: 8 }} />
            {input('CARBS (g)', carbs, setCarbs)}
            <View style={{ width: 8 }} />
            {input('FAT (g)', fat, setFat)}
            <View style={{ width: 8 }} />
            {input('FIBER (g)', fiber, setFiber)}
          </View>

          <View style={modalStyles.btnRow}>
            <PillButton label="Cancel" variant="outline" onPress={onClose} style={{ flex: 1, marginRight: 8 }} />
            <PillButton label="Save" variant="gradient" onPress={handleSave} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function NutritionScreen({ navigation }: any) {
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [goals, setGoals] = useState<UserGoals>(DEFAULT_GOALS);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    const [data, savedGoals] = await Promise.all([
      Storage.get<NutritionLog>(Storage.KEYS.NUTRITION_LOGS),
      Storage.getOne<UserGoals>(Storage.KEYS.USER_GOALS),
    ]);
    setLogs(data);
    if (savedGoals) setGoals(savedGoals);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayLogs = logs.filter(l => new Date(l.timestamp) >= today).reverse();

  const totals = todayLogs.reduce((acc, l) => ({
    calories: acc.calories + l.calories,
    protein: acc.protein + l.protein,
    carbs: acc.carbs + l.carbs,
    fat: acc.fat + l.fat,
    fiber: acc.fiber + l.fiber,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  const handleSave = async (partial: Partial<NutritionLog>) => {
    const entry: NutritionLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...partial,
    } as NutritionLog;
    const updated = [...logs, entry];
    await Storage.set(Storage.KEYS.NUTRITION_LOGS, updated);
    setLogs(updated);
    setShowAdd(false);
  };

  const macros = [
    { label: 'Calories', value: totals.calories, goal: goals.dailyCalories, color: COLORS.orange, unit: 'kcal' },
    { label: 'Protein', value: totals.protein, goal: goals.dailyProtein, color: COLORS.purple, unit: 'g' },
    { label: 'Carbs', value: totals.carbs, goal: goals.dailyCarbs, color: COLORS.blue, unit: 'g' },
    { label: 'Fat', value: totals.fat, goal: goals.dailyFat, color: COLORS.green, unit: 'g' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Nutrition</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={24} color={COLORS.purple} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Macro rings */}
        <View style={[styles.ringCard, SHADOW.sm]}>
          <View style={styles.ringsRow}>
            {macros.map(m => (
              <ProgressRing
                key={m.label}
                size={72} strokeWidth={6}
                progress={m.goal > 0 ? m.value / m.goal : 0}
                color={m.color}
                label={`${Math.round(m.value)}`}
                sublabel={m.unit}
              />
            ))}
          </View>

          {/* Macro bars */}
          <View style={styles.barsContainer}>
            {macros.map(m => (
              <View key={m.label} style={styles.barRow}>
                <Text style={styles.barLabel}>{m.label}</Text>
                <View style={styles.barBg}>
                  <LinearGradient
                    colors={[m.color, m.color + '66'] as [string, string]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[styles.barFill, { width: `${Math.min((m.value / m.goal) * 100, 100)}%` as any }]}
                  />
                </View>
                <Text style={styles.barValue}>{Math.round(m.value)}/{m.goal}{m.unit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Fiber */}
        <View style={[styles.fiberCard, SHADOW.sm]}>
          <View style={styles.fiberRow}>
            <Ionicons name="leaf" size={18} color={COLORS.green} />
            <Text style={styles.fiberLabel}>Fiber</Text>
            <Text style={styles.fiberValue}>{totals.fiber.toFixed(1)}g / {goals.dailyFiber}g</Text>
          </View>
          <View style={styles.barBg}>
            <LinearGradient
              colors={[COLORS.green, COLORS.green + '66'] as [string, string]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.barFill, { width: `${Math.min((totals.fiber / goals.dailyFiber) * 100, 100)}%` as any }]}
            />
          </View>
        </View>

        {/* Today's meals */}
        <Text style={styles.sectionLabel}>TODAY'S MEALS</Text>
        {todayLogs.length === 0 && (
          <View style={[styles.emptyCard, SHADOW.sm]}>
            <Text style={styles.emptyText}>No meals logged yet</Text>
          </View>
        )}
        {todayLogs.map(log => (
          <View key={log.id} style={[styles.mealCard, SHADOW.sm]}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealName}>{log.meal}</Text>
              <Text style={styles.mealCal}>{log.calories} kcal</Text>
            </View>
            <View style={styles.mealMacros}>
              {[
                { label: 'P', value: log.protein, color: COLORS.purple },
                { label: 'C', value: log.carbs, color: COLORS.blue },
                { label: 'F', value: log.fat, color: COLORS.orange },
              ].map(m => (
                <View key={m.label} style={styles.mealMacro}>
                  <Text style={[styles.mealMacroLabel, { color: m.color }]}>{m.label}</Text>
                  <Text style={styles.mealMacroValue}>{m.value.toFixed(0)}g</Text>
                </View>
              ))}
              <Text style={styles.mealTime}>
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>

      <AddMealModal visible={showAdd} onClose={() => setShowAdd(false)} onSave={handleSave} />
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
  ringCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: 12,
  },
  ringsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  barsContainer: { gap: 10 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { color: COLORS.textSecondary, fontSize: 11, width: 54 },
  barBg: { flex: 1, height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2 },
  barValue: { color: COLORS.textSecondary, fontSize: 10, width: 70, textAlign: 'right' },
  fiberCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: 12,
  },
  fiberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  fiberLabel: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', flex: 1 },
  fiberValue: { color: COLORS.textSecondary, fontSize: 13 },
  sectionLabel: {
    color: COLORS.textSecondary, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.2, textTransform: 'uppercase',
    marginBottom: 8, marginTop: 8,
  },
  emptyCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center',
  },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
  mealCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: 8,
  },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  mealName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
  mealCal: { color: COLORS.orange, fontSize: 14, fontWeight: '600' },
  mealMacros: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mealMacro: { flexDirection: 'row', gap: 3 },
  mealMacroLabel: { fontSize: 12, fontWeight: '700' },
  mealMacroValue: { color: COLORS.textSecondary, fontSize: 12 },
  mealTime: { color: COLORS.textTertiary, fontSize: 11, marginLeft: 'auto' },
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
  row: { flexDirection: 'row', marginTop: 4 },
  btnRow: { flexDirection: 'row', marginTop: 20 },
});
