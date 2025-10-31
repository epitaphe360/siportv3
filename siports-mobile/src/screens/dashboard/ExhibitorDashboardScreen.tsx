import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuthStore } from '../../stores/authStore';

export default function ExhibitorDashboardScreen() {
  const { user } = useAuthStore();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tableau de bord Exposant</Text>
        <Text style={styles.subtitle}>Bienvenue, {user?.name}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Mes Statistiques</Text>
        <Text style={styles.cardText}>Vues du mini-site, rendez-vous confirmés, etc.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Rendez-vous reçus</Text>
        <Text style={styles.cardText}>Gérez les demandes de rendez-vous des visiteurs</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 20, backgroundColor: '#7c3aed' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#e9d5ff' },
  card: { backgroundColor: '#fff', margin: 15, padding: 20, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  cardText: { fontSize: 14, color: '#666' },
});
