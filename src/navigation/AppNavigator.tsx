import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

import HomeScreen from '../screens/HomeScreen';
import InventoryScreen from '../screens/InventoryScreen';
import InsightsScreen from '../screens/InsightsScreen';
import ResearchScreen from '../screens/ResearchScreen';
import HydrationScreen from '../screens/HydrationScreen';
import NutritionScreen from '../screens/NutritionScreen';
import DoseLogScreen from '../screens/DoseLogScreen';
import WeightScreen from '../screens/WeightScreen';
import CheckInScreen from '../screens/CheckInScreen';
import SideEffectsScreen from '../screens/SideEffectsScreen';
import CalculatorScreen from '../screens/CalculatorScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Hydration" component={HydrationScreen} />
      <Stack.Screen name="Nutrition" component={NutritionScreen} />
      <Stack.Screen name="DoseLog" component={DoseLogScreen} />
      <Stack.Screen name="Weight" component={WeightScreen} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
      <Stack.Screen name="SideEffects" component={SideEffectsScreen} />
      <Stack.Screen name="Calculator" component={CalculatorScreen} />
      <Stack.Screen name="Inventory" component={InventoryScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function TrackStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TrackHome" component={TrackScreen} />
      <Stack.Screen name="Hydration" component={HydrationScreen} />
      <Stack.Screen name="Nutrition" component={NutritionScreen} />
      <Stack.Screen name="DoseLog" component={DoseLogScreen} />
      <Stack.Screen name="Weight" component={WeightScreen} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
      <Stack.Screen name="SideEffects" component={SideEffectsScreen} />
      <Stack.Screen name="Calculator" component={CalculatorScreen} />
    </Stack.Navigator>
  );
}

function TrackScreen({ navigation }: any) {
  const tools = [
    { label: 'Dose Log', icon: 'medical', screen: 'DoseLog', bg: COLORS.purpleLight, color: COLORS.purple },
    { label: 'Hydration', icon: 'water', screen: 'Hydration', bg: COLORS.blueLight, color: COLORS.blue },
    { label: 'Nutrition', icon: 'restaurant', screen: 'Nutrition', bg: COLORS.orangeLight, color: COLORS.orange },
    { label: 'Weight', icon: 'scale', screen: 'Weight', bg: COLORS.blueLight, color: COLORS.blue },
    { label: 'Check-In', icon: 'heart', screen: 'CheckIn', bg: COLORS.pinkLight, color: COLORS.coral },
    { label: 'Side Effects', icon: 'alert-circle', screen: 'SideEffects', bg: COLORS.goldLight, color: COLORS.gold },
    { label: 'Calculator', icon: 'calculator', screen: 'Calculator', bg: COLORS.greenLight, color: COLORS.green },
  ];

  return (
    <View style={trackStyles.container}>
      <View style={trackStyles.header}>
        <Text style={trackStyles.title}>Track</Text>
        <Text style={trackStyles.subtitle}>Log your daily data</Text>
      </View>
      <View style={trackStyles.grid}>
        {tools.map(tool => (
          <TouchableOpacity
            key={tool.label}
            style={[trackStyles.card, SHADOW.sm]}
            onPress={() => navigation.navigate(tool.screen)}
            activeOpacity={0.82}
          >
            <View style={[trackStyles.iconWrap, { backgroundColor: tool.bg }]}>
              <Ionicons name={tool.icon as any} size={26} color={tool.color} />
            </View>
            <Text style={trackStyles.cardLabel}>{tool.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: COLORS.textPrimary, fontSize: 20, fontWeight: '700' }}>Settings</Text>
      <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>Coming soon</Text>
    </View>
  );
}

const trackStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingTop: 58, paddingHorizontal: 16, paddingBottom: 16 },
  title: { color: COLORS.textPrimary, fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, marginTop: 2 },
  grid: { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: 18, alignItems: 'flex-start',
  },
  iconWrap: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardLabel: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
});

// Custom center FAB tab bar button
function LogButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={fabStyles.wrap}>
      <LinearGradient
        colors={['#7C5CFC', '#B09CFE']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={fabStyles.fab}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const fabStyles = StyleSheet.create({
  wrap: { top: -20, justifyContent: 'center', alignItems: 'center' },
  fab: {
    width: 58, height: 58, borderRadius: 29,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOW.md,
  },
});

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: COLORS.purple,
          tabBarInactiveTintColor: COLORS.textTertiary,
          tabBarLabelStyle: styles.tabLabel,
          tabBarBackground: () => <View style={[StyleSheet.absoluteFill, styles.tabBarBg]} />,
          tabBarIcon: ({ color, focused }) => {
            const icons: Record<string, [string, string]> = {
              Home: ['home', 'home-outline'],
              Inventory: ['flask', 'flask-outline'],
              Track: ['add-circle', 'add-circle-outline'],
              Insights: ['stats-chart', 'stats-chart-outline'],
              Research: ['book', 'book-outline'],
            };
            const [active, inactive] = icons[route.name] || ['ellipse', 'ellipse-outline'];
            if (route.name === 'Track') return null; // replaced by FAB
            return <Ionicons name={(focused ? active : inactive) as any} size={23} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Inventory" component={InventoryScreen} />
        <Tab.Screen
          name="Track"
          component={TrackStack}
          options={{
            tabBarLabel: '',
            tabBarButton: (props) => <LogButton onPress={props.onPress as any} />,
          }}
        />
        <Tab.Screen name="Insights" component={InsightsScreen} />
        <Tab.Screen name="Research" component={ResearchScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    elevation: 0,

  },
  tabBarBg: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tabLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.2 },
});
