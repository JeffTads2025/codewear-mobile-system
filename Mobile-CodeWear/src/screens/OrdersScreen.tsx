import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../services/api';

export function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    api.get('orders?limit=50').then(({ data }) => setOrders(data.orders || data)).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#ffcc00" /></View>;
  return <View style={styles.container}><TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Voltar para a loja</Text></TouchableOpacity><FlatList contentContainerStyle={styles.content} data={orders} keyExtractor={(item) => String(item.id)} ListEmptyComponent={<Text style={styles.empty}>Você ainda não fez pedidos.</Text>} renderItem={({ item }) => <View style={styles.order}>
    <Text style={styles.title}>Pedido #{item.id}</Text>
    <Text style={styles.text}>Data: {new Date(item.createdAt).toLocaleString('pt-BR')}</Text>
    <Text style={styles.text}>Status: {item.status}</Text>
    <Text style={styles.text}>Pagamento: {item.paymentMethod}</Text>
    <Text style={styles.text}>Entrega: {item.address}</Text>
    <Text style={styles.total} numberOfLines={1}>R$ {Number(item.totalValue || 0).toFixed(2).replace('.', ',')}</Text>
    {(item.OrderItems || item.orderItems || []).map((orderItem: any) => <View key={orderItem.id} style={styles.item}><Image source={{ uri: orderItem.Product?.image_url || orderItem.product?.image_url }} style={styles.itemImage} /><Text style={styles.text}>Produto: {orderItem.Product?.name || orderItem.product?.name || `#${orderItem.productId}`} x {orderItem.quantity}{orderItem.size ? ` (${orderItem.size})` : ''}</Text></View>)}
  </View>} /></View>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#0d0d0d' }, content: { padding: 20 }, center: { flex: 1, backgroundColor: '#0d0d0d', justifyContent: 'center', alignItems: 'center' }, back: { color: '#ffcc00', padding: 20, paddingBottom: 0 }, empty: { color: '#aaa', textAlign: 'center', marginTop: 40 }, order: { backgroundColor: '#171717', borderWidth: 1, borderColor: '#2b2b2b', borderRadius: 8, padding: 16, marginBottom: 12 }, title: { color: '#fff', fontSize: 17, fontWeight: 'bold', marginBottom: 8 }, text: { color: '#aaa', marginBottom: 4, flex: 1 }, item: { flexDirection: 'row', alignItems: 'center', marginTop: 8 }, itemImage: { width: 42, height: 42, borderRadius: 5, marginRight: 8 }, total: { color: '#ffcc00', fontSize: 18, fontWeight: 'bold', marginTop: 10 } });
