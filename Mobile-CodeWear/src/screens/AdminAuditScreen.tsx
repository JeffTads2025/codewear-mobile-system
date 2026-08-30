import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { api } from '../services/api';

export function AdminAuditScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('admin/logs?limit=50')
      .then(({ data }) => setLogs(data.logs || []))
      .catch((error) => console.error('Erro ao carregar auditoria:', error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auditoria & Logs</Text>
      {loading ? <ActivityIndicator color="#ffcc00" /> : (
        <FlatList
          data={logs}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<Text style={styles.subtitle}>Nenhum registro encontrado.</Text>}
          renderItem={({ item }) => <View style={styles.row}><Text style={styles.action}>{({ CREATE_PRODUCT: 'Produto criado', UPDATE_PRODUCT: 'Produto atualizado', DELETE_PRODUCT: 'Produto excluído', DELETE_ORDER: 'Pedido excluído' } as any)[item.action] || item.action}</Text><Text style={styles.subtitle}>Por: {item.adminName || 'Administrador'}</Text><Text style={styles.subtitle}>{item.details}</Text><Text style={styles.date}>{new Date(item.createdAt).toLocaleString('pt-BR')}</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  title: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
  subtitle: { color: '#888', marginTop: 8 },
  row: { borderBottomWidth: 1, borderBottomColor: '#222', paddingVertical: 14 },
  action: { color: '#fff', fontWeight: 'bold' },
  date: { color: '#ffcc00', marginTop: 5, fontSize: 12 },
});