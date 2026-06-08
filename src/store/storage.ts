import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PEPTIDES: '@peptides',
  DOSE_LOGS: '@dose_logs',
  SIDE_EFFECTS: '@side_effects',
  WATER_LOGS: '@water_logs',
  NUTRITION_LOGS: '@nutrition_logs',
  WEIGHT_LOGS: '@weight_logs',
  PROGRESS_PHOTOS: '@progress_photos',
  CHECK_INS: '@check_ins',
  USER_GOALS: '@user_goals',
};

async function get<T>(key: string): Promise<T[]> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

async function set<T>(key: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

async function getOne<T>(key: string): Promise<T | null> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

async function setOne<T>(key: string, data: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export const Storage = { get, set, getOne, setOne, KEYS };
