import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { api } from '../services/api';

export function AdminCustomersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    api.get('admin/users?limit=50')
      .then(({ data }) => setUsers(data.users || []))
      .catch((error) => console.error('Erro ao carregar clientes:', error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Clientes Cadastrados</Text>
      {loading ? <ActivityIndicator color="#ffcc00" /> : (
      <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<Text style={styles.subtitle}>Nenhum cliente encontrado.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => setSelectedUser(item)}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.subtitle}>{item.email}</Text>
              {item.phone && <Text style={styles.detail}>📱 {item.phone}</Text>}
              {item.cpf && <Text style={styles.detail}>📋 CPF: {item.cpf}</Text>}
            </TouchableOpacity>
          )}
        />
      )}
      <Modal visible={!!selectedUser} transparent animationType="slide" onRequestClose={() => setSelectedUser(null)}><View style={styles.overlay}><View style={styles.modal}><Text style={styles.name}>Dados do cliente</Text>{selectedUser && Object.entries(selectedUser).filter(([key]) => !['password'].includes(key)).map(([key, value]) => <Text style={styles.detail} key={key}>{key}: {String(value ?? '-')}</Text>)}<TouchableOpacity onPress={() => setSelectedUser(null)}><Text style={styles.close}>Fechar</Text></TouchableOpacity></View></View></Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  title: { fontSize: 20, color: '#fff', fontWeight: 'bold', marginBottom: 16 },
  subtitle: { color: '#888', marginTop: 8, fontSize: 12 },
  row: { 
    backgroundColor: '#161616', 
    borderWidth: 1, 
    borderColor: '#222', 
    borderRadius: 8, 
    paddingVertical: 14, 
    paddingHorizontal: 12,
    marginBottom: 8
  },
  name: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  detail: { color: '#aaa', fontSize: 11, marginTop: 6 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.8)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#171717', padding: 20, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  close: { color: '#ffcc00', marginTop: 20, textAlign: 'right', fontWeight: 'bold' },
});