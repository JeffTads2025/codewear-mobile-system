import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { api } from '../services/api';
import Toast from 'react-native-toast-message';
import { sortSizes } from '../utils/sizes';

export function AdminDashboardScreen() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [promotionCode, setPromotionCode] = useState('');
  const [promotionDiscount, setPromotionDiscount] = useState('');
  const [promotionValidUntil, setPromotionValidUntil] = useState('');
  const [sizeStocks, setSizeStocks] = useState({ P: '', M: '', G: '', GG: '' });
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [savingProductId, setSavingProductId] = useState<number | null>(null);

  useEffect(() => {
    api.get('products?limit=100')
      .then(({ data }) => setProducts(data.products || data))
      .catch((error) => console.error('Erro ao carregar estoque:', error))
      .finally(() => setLoadingProducts(false));
  }, []);

  const formatDateBRtoISO = (value: string) => {
    const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return undefined;
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  };

  const handleValidUntilChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
    setPromotionValidUntil(parts.join('/'));
  };

  const updateStock = async (product: any) => {
    setSavingProductId(product.id);
    try {
      const response = await api.put(`products/${product.id}`, {
        name: product.name,
        price: Math.max(0, Number(product.price) || 0),
        description: product.description,
        stock: Math.max(0, Number(product.stock) || 0),
        sizes: sortSizes(product.sizes?.length ? product.sizes : ['P', 'M', 'G', 'GG'].map((size) => ({ size, stock: 0 }))).map((size: any) => ({
          size: size.size,
          stock: Math.max(0, Number(size.stock) || 0),
        })),
      });
      setProducts((current) => current.map((item) => item.id === product.id ? response.data.product : item));
      Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Estoque atualizado.' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Erro', text2: error.response?.data?.message || 'Não foi possível atualizar o estoque.' });
    } finally {
      setSavingProductId(null);
    }
  };

  const handleCreateProduct = async () => {
    if (!name || !price) {
      Toast.show({ type: 'info', text1: 'Atenção', text2: 'Preencha os campos obrigatórios.' });
      return;
    }
    try {
      await api.post('products', {
        name,
        price: Number(price.replace(',', '.')),
        stock: Number(stock || 0),
        image_url: imageUrl || undefined,
        sizes: sortSizes(Object.entries(sizeStocks).map(([size, value]) => ({ size, stock: Number(value) || 0 }))),
        promotions: promotionCode ? [{
          code: promotionCode.trim().toUpperCase(),
          discountPercentage: Number(promotionDiscount.replace(',', '.')),
          validUntil: formatDateBRtoISO(promotionValidUntil),
          isActive: true,
        }] : [],
      });
      Toast.show({ type: 'success', text1: 'Sucesso', text2: `Produto "${name}" cadastrado!` });
      setName(''); setPrice(''); setStock(''); setImageUrl(''); setPromotionCode(''); setPromotionDiscount(''); setPromotionValidUntil(''); setSizeStocks({ P: '', M: '', G: '', GG: '' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Erro', text2: error.response?.data?.message || 'Não foi possível cadastrar o produto.' });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Painel de Gestão</Text>

      {/* Formulário Novo Produto */}
      <View style={styles.cardBox}>
        <Text style={styles.yellowTitle}>+ Novo Produto</Text>

        <Text style={styles.label}>Nome do Produto</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: Camiseta Dev" placeholderTextColor="#555" />

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Preço (R$)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={price} onChangeText={setPrice} placeholder="0.00" placeholderTextColor="#555" />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Estoque</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={stock} onChangeText={setStock} placeholder="0" placeholderTextColor="#555" />
          </View>
        </View>
        <Text style={styles.label}>Estoque por tamanho</Text>
        <View style={styles.row}>{Object.keys(sizeStocks).map((size) => <TextInput key={size} style={styles.sizeInput} keyboardType="numeric" placeholder={size} placeholderTextColor="#666" value={sizeStocks[size as keyof typeof sizeStocks]} onChangeText={(value) => setSizeStocks((current) => ({ ...current, [size]: value }))} />)}</View>

        <Text style={styles.label}>URL da Imagem</Text>
        <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." placeholderTextColor="#555" />

        <Text style={styles.label}>Código de desconto (opcional)</Text>
        <TextInput style={styles.input} value={promotionCode} onChangeText={setPromotionCode} placeholder="DEV10" placeholderTextColor="#555" autoCapitalize="characters" />
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Desconto (%)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={promotionDiscount} onChangeText={setPromotionDiscount} placeholder="10" placeholderTextColor="#555" />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Validade (DD/MM/AAAA)</Text>
            <TextInput style={styles.input} value={promotionValidUntil} onChangeText={handleValidUntilChange} placeholder="31/12/2026" placeholderTextColor="#555" keyboardType="numeric" maxLength={10} />
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleCreateProduct}>
          <Text style={styles.submitText}>Cadastrar Produto</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Estoque atual</Text>
      {loadingProducts ? <ActivityIndicator color="#ffcc00" /> : products.map((product) => {
        const stockSizes = sortSizes(product.sizes?.length ? product.sizes : ['P', 'M', 'G', 'GG'].map((size) => ({ size, stock: 0 })));
        return (
          <View style={styles.stockCard} key={product.id}>
            <View style={styles.productHeader}><Image source={{ uri: product.image_url }} style={styles.stockImage} /><Text style={styles.productTitle}>{product.name}</Text></View>
            <Text style={Number(product.stock) > 0 ? styles.inStock : styles.outOfStock}>
              {Number(product.stock) > 0 ? 'Em estoque' : 'Esgotado'}
            </Text>
            <Text style={styles.label}>Quantidade total</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(product.stock ?? 0)}
              onChangeText={(value) => setProducts((current) => current.map((item) => item.id === product.id ? { ...item, stock: value } : item))}
            />
            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={String(product.name || '')} onChangeText={(value) => setProducts((current) => current.map((item) => item.id === product.id ? { ...item, name: value } : item))} />
            <Text style={styles.label}>Descrição</Text>
            <TextInput style={styles.input} value={String(product.description || '')} onChangeText={(value) => setProducts((current) => current.map((item) => item.id === product.id ? { ...item, description: value } : item))} multiline />
            <Text style={styles.label}>Preço</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={String(product.price || 0)} onChangeText={(value) => setProducts((current) => current.map((item) => item.id === product.id ? { ...item, price: value } : item))} />
            {stockSizes.map((size: any) => (
              <View style={styles.sizeRow} key={size.id || size.size}>
                <Text style={styles.sizeName}>Tamanho {size.size}</Text>
                <TextInput
                  style={styles.sizeInput}
                  keyboardType="numeric"
                  value={String(size.stock ?? 0)}
                  onChangeText={(value) => setProducts((current) => current.map((item) => item.id === product.id
                    ? { ...item, sizes: (item.sizes?.length ? item.sizes : stockSizes).map((itemSize: any) => itemSize.size === size.size ? { ...itemSize, stock: value } : itemSize) }
                    : item))}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.stockButton} disabled={savingProductId === product.id} onPress={() => updateStock(product)}>
              <Text style={styles.submitText}>{savingProductId === product.id ? 'Salvando...' : 'Atualizar'}</Text>
              
            </TouchableOpacity>
          </View>
          

        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  headerTitle: { fontSize: 22, color: '#fff', fontWeight: 'bold', marginBottom: 16 },
  cardBox: { backgroundColor: '#161616', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#222', marginBottom: 20 },
  yellowTitle: { color: '#ffcc00', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  label: { color: '#aaa', fontSize: 12, marginTop: 8, marginBottom: 4 },
  input: { backgroundColor: '#0d0d0d', borderWidth: 1, borderColor: '#2b2b2b', color: '#fff', borderRadius: 6, padding: 10 },
  row: { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },
  submitButton: { backgroundColor: '#0080ff', borderRadius: 6, padding: 12, alignItems: 'center', marginTop: 16 },
  submitText: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, color: '#fff', fontWeight: 'bold', marginBottom: 10 },
  stockCard: { backgroundColor: '#161616', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#222', marginBottom: 12 },
  productHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stockImage: { width: 72, height: 72, borderRadius: 8, backgroundColor: '#222' },
  productTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  subtitle: { color: '#888', marginTop: 8 },
  inStock: { color: '#00ff88', marginTop: 4 },
  outOfStock: { color: '#ff7777', marginTop: 4 },
  sizeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  sizeName: { color: '#aaa', width: 110 },
  sizeInput: { flex: 1, backgroundColor: '#0d0d0d', borderWidth: 1, borderColor: '#2b2b2b', color: '#fff', borderRadius: 6, padding: 10 },
  stockButton: { backgroundColor: '#0080ff', borderRadius: 6, padding: 12, alignItems: 'center', marginTop: 14 },
});