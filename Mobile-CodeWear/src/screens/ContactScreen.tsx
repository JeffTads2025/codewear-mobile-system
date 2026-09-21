import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function ContactScreen() {
  const navigation = useNavigation();
  return <ScrollView contentContainerStyle={styles.container}>
    <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>Voltar</Text></TouchableOpacity>
    <Text style={styles.title}>Contato</Text>
    <Text style={styles.label}>Telefone</Text>
    <Text style={styles.value}>(44) 998358015</Text>
    <Text style={styles.label}>E-mail</Text>
    <Text style={styles.value}>tshirts@codewear.com</Text>
    <Text style={styles.label}>Av. Cap. Índio Bandeira, 1000</Text>
    <Text style={styles.value}>www.codewear.com</Text>
  </ScrollView>;
}

const styles = StyleSheet.create({ container: { flexGrow: 1, backgroundColor: '#0d0d0d', padding: 24 }, back: { color: '#ffcc00', marginBottom: 24 }, title: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 28 }, label: { color: '#888', marginTop: 16 }, value: { color: '#fff', fontSize: 17, marginTop: 5 } });
