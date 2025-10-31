import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuthStore } from '../../stores/authStore';

export default function VisitorDashboardScreen() {
  const { user } = useAuthStore();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenue, {user?.name}!</Text>
        <Text style={styles.subtitle}>Tableau de bord Visiteur</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Mes Rendez-vous</Text>
        <Text style={styles.cardText}>Accédez à l'onglet "Rendez-vous" pour voir vos réservations</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>👥 Networking</Text>
        <Text style={styles.cardText}>Connectez-vous avec les exposants et partenaires</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎯 Événements</Text>
        <Text style={styles.cardText}>Découvrez les événements du salon SIPORTS 2026</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#7c3aed',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e9d5ff',
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
  },
});
