import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../stores/authStore';
import { Ionicons } from '@expo/vector-icons';

// Dashboard Screens
import AdminDashboardScreen from '../screens/dashboard/AdminDashboardScreen';
import ExhibitorDashboardScreen from '../screens/dashboard/ExhibitorDashboardScreen';
import PartnerDashboardScreen from '../screens/dashboard/PartnerDashboardScreen';
import VisitorDashboardScreen from '../screens/dashboard/VisitorDashboardScreen';

// Shared Screens
import AppointmentsScreen from '../screens/appointments/AppointmentsScreen';
import NetworkingScreen from '../screens/networking/NetworkingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Appointments: undefined;
  Networking: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { user } = useAuthStore();

  const getDashboardScreen = () => {
    switch (user?.type) {
      case 'admin':
        return AdminDashboardScreen;
      case 'exhibitor':
        return ExhibitorDashboardScreen;
      case 'partner':
        return PartnerDashboardScreen;
      case 'visitor':
      default:
        return VisitorDashboardScreen;
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Appointments') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Networking') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#7c3aed',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={getDashboardScreen()}
        options={{
          title: 'Accueil',
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          title: 'Rendez-vous',
        }}
      />
      <Tab.Screen
        name="Networking"
        component={NetworkingScreen}
        options={{
          title: 'Réseau',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
}
