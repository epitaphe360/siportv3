import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AppointmentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📅 Écran de Rendez-vous</Text>
      <Text style={styles.subtext}>Liste et gestion des rendez-vous à implémenter</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  text: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtext: { fontSize: 14, color: '#666', marginTop: 10 },
});
