export interface Peptide {
  id: string;
  name: string;
  type: 'peptide' | 'glp1';
  concentration: number; // mg/mL
  vialSize: number; // mg
  waterAdded: number; // mL BAC water
  currentAmount: number; // mg remaining
  color: string;
  notes: string;
  createdAt: string;
  photo?: string;
}

export interface DoseLog {
  id: string;
  peptideId: string;
  peptideName: string;
  dose: number; // units (mcg or mg)
  unit: 'mcg' | 'mg' | 'units';
  injectionSite: string;
  timestamp: string;
  notes: string;
  sideEffects: SideEffect[];
}

export interface SideEffect {
  id: string;
  symptom: string;
  severity: 1 | 2 | 3 | 4 | 5;
  timestamp: string;
  doseLogId?: string;
  notes: string;
}

export interface WaterLog {
  id: string;
  amount: number; // ml
  timestamp: string;
}

export interface NutritionLog {
  id: string;
  meal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  timestamp: string;
  photo?: string;
}

export interface WeightLog {
  id: string;
  weight: number;
  unit: 'lbs' | 'kg';
  timestamp: string;
  notes: string;
}

export interface ProgressPhoto {
  id: string;
  uri: string;
  timestamp: string;
  notes: string;
  category: 'front' | 'side' | 'back' | 'other';
}

export interface CheckIn {
  id: string;
  timestamp: string;
  energy: 1 | 2 | 3 | 4 | 5;
  sleep: 1 | 2 | 3 | 4 | 5;
  mood: 1 | 2 | 3 | 4 | 5;
  notes: string;
}

export interface UserGoals {
  dailyWater: number; // ml
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  dailyFiber: number;
  targetWeight: number;
  weightUnit: 'lbs' | 'kg';
}

export interface ResearchCompound {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  halfLife: string;
  peakTime: string;
  summary: string;
  references: string[];
  tags: string[];
}
