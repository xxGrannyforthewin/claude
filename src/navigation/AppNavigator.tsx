import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

import HomeScreen from '../screens/HomeScreen';
import InventoryScreen from '../screens/InventoryScreen';
import InsightsScreen from '../screens/InsightsScreen';
import ResearchScreen from '../screens/ResearchScreen';

// Utility screens (accessible from tab or deep-link)
import HydrationScreen from '../screens/HydrationScreen';
import NutritionScreen from '../screens/NutritionScreen';
import DoseLogScreen from '../screens/DoseLogScreen';
import WeightScreen from '../screens/WeightScreen';
import CheckInScreen from '../screens/CheckInScreen';
import SideEffectsScreen from '../screens/SideEffectsScreen';
import CalculatorScreen from '../screens/CalculatorScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MoreHome" component={MoreHomeScreen} />
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
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

// Simple more screen with grid of tools
import { Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SPACING, RADIUS } from '../constants/theme';

function MoreHomeScreen({ navigation }: any) {
  const tools = [
    { label: 'Hydration', icon: 'water', screen: 'Hydration', color: COLORS.accentAlt },
    { label: 'Nutrition', icon: 'restaurant', screen: 'Nutrition', color: COLORS.accentWarm },
    { label: 'Dose Log', icon: 'medical', screen: 'DoseLog', color: COLORS.accent },
    { label: 'Weight', icon: 'scale', screen: 'Weight', color: COLORS.accentBlue },
    { label: 'Check-In', icon: 'heart', screen: 'CheckIn', color: COLORS.accentRed },
    { label: 'Side Effects', icon: 'alert-circle', screen: 'SideEffects', color: COLORS.accentYellow },
    { label: 'Calculator', icon: 'calculator', screen: 'Calculator', color: COLORS.accentGreen },
  ];

  return (
    <View style={moreStyles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0A0F', '#0A0F0A']} style={StyleSheet.absoluteFill} />
      <View style={moreStyles.header}>
        <Text style={moreStyles.title}>Tools</Text>
      </View>
      <ScrollView contentContainerStyle={moreStyles.scroll}>
        <View style={moreStyles.grid}>
          {tools.map(tool => (
            <TouchableOpacity
              key={tool.label}
              style={moreStyles.toolCard}
              onPress={() => navigation.navigate(tool.screen)}
              activeOpacity={0.75}
            >
              <LinearGradient
                colors={[tool.color + '22', tool.color + '08'] as [string, string]}
                style={moreStyles.toolCardInner}
              >
                <View style={[moreStyles.iconCircle, { backgroundColor: tool.color + '22', borderColor: tool.color + '44' }]}>
                  <Ionicons name={tool.icon as any} size={26} color={tool.color} />
                </View>
                <Text style={moreStyles.toolLabel}>{tool.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
      <LinearGradient colors={['#0A0A0F', '#0F0A18']} style={StyleSheet.absoluteFill} />
      <Text style={{ color: COLORS.textPrimary, fontSize: 20, fontWeight: '700' }}>Settings</Text>
      <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>Coming soon</Text>
    </View>
  );
}

const moreStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingTop: 60, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  title: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '800' },
  scroll: { paddingHorizontal: SPACING.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  toolCard: { width: '47%', borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.bgGlassBorder },
  toolCardInner: { padding: 20, alignItems: 'flex-start', minHeight: 100 },
  iconCircle: {
    width: 48, height: 48, borderRadius: 16,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  toolLabel: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
});

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: COLORS.textTertiary,
          tabBarShowLabel: true,
          tabBarLabelStyle: styles.tabLabel,
          tabBarBackground: () => (
            <LinearGradient
              colors={['rgba(10,10,15,0.97)', 'rgba(10,10,15,1)']}
              style={StyleSheet.absoluteFill}
            />
          ),
          tabBarIcon: ({ color, size, focused }) => {
            const icons: Record<string, [string, string]> = {
              Home: ['home', 'home-outline'],
              Inventory: ['flask', 'flask-outline'],
              Insights: ['stats-chart', 'stats-chart-outline'],
              Research: ['book', 'book-outline'],
              Tools: ['grid', 'grid-outline'],
            };
            const [active, inactive] = icons[route.name] || ['ellipse', 'ellipse-outline'];
            return (
              <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
                <Ionicons name={(focused ? active : inactive) as any} size={22} color={color} />
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Inventory" component={InventoryScreen} />
        <Tab.Screen name="Insights" component={InsightsScreen} />
        <Tab.Screen name="Research" component={ResearchScreen} />
        <Tab.Screen name="Tools" component={MoreStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: COLORS.bgGlassBorder,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    elevation: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  tabIconWrap: {
    width: 40, height: 32, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: COLORS.accent + '18',
  },
});
