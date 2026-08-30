import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../routes';
import { useCart } from '../context/CartContext';
import { sortSizes } from '../utils/sizes';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen() {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { addToCart } = useCart();

  const { product } = route.params;

  // Resolução segura de propriedades sem type casting ('any')
  const productName = product.name ?? product.nome ?? 'Produto';
  const imageUrl = product.image_url ?? product.image ?? product.imagemUrl ?? 'https://via.placeholder.com/300';
  const productPrice = Number(product.price ?? product.preco ?? 0);
  const productStock = product.stock ?? product.estoque ?? 0;
  const productDescription = product.description ?? product.descricao ?? 'Sem descrição cadastrada.';

  // Tratamento dos tamanhos
  const rawSizes = product.sizes;
  const availableSizes: string[] = Array.isArray(rawSizes)
    ? rawSizes.map((s) => (typeof s === 'string' ? s : s.size))
    : ['P', 'M', 'G', 'GG'];
  const orderedSizes = sortSizes(availableSizes);

  const [selectedSize, setSelectedSize] = useState<string>(orderedSizes[0] || 'M');
  const [quantity, setQuantity] = useState<number>(1);

  const isOutOfStock = productStock === 0;

  const handleQuantityChange = (delta: number) => {
    const next = quantity + delta;
    if (next >= 1 && next <= productStock) {
      setQuantity(next);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
    navigation.navigate('Cart');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Botão Voltar */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>← Voltar</Text>
      </TouchableOpacity>

      {/* Imagem do Produto */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      </View>

      {/* Detalhes do Produto */}
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{productName}</Text>

        <View style={styles.stockBadge}>
          {isOutOfStock ? (
            <Text style={styles.outOfStock}>❌ Esgotado</Text>
          ) : (
            <Text style={styles.inStock}>✅ Em Estoque: {productStock} un</Text>
          )}
        </View>

        <Text style={styles.price} numberOfLines={1}>R$ {productPrice.toFixed(2).replace('.', ',')}</Text>

        <Text style={styles.sectionLabel}>Descrição</Text>
        <Text style={styles.description}>{productDescription}</Text>

        {/* Seleção de Tamanho */}
        {orderedSizes.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Tamanho</Text>
            <View style={styles.sizeContainer}>
              {orderedSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.sizeButtonActive,
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize === size && styles.sizeTextActive,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Controle de Quantidade */}
        <Text style={styles.sectionLabel}>Quantidade</Text>
        <View style={styles.qtyContainer}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => handleQuantityChange(-1)}
            disabled={isOutOfStock}
          >
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{isOutOfStock ? 0 : quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => handleQuantityChange(1)}
            disabled={isOutOfStock}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Botão Adicionar ao Carrinho */}
        <TouchableOpacity
          style={[styles.addToCartBtn, isOutOfStock && styles.btnDisabled]}
          disabled={isOutOfStock}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>
            {isOutOfStock ? 'Produto Indisponível' : '🛒 Adicionar ao Carrinho'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backBtnText: {
    color: '#FFCC00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  stockBadge: {
    marginBottom: 12,
  },
  inStock: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: '600',
  },
  outOfStock: {
    color: '#FF5252',
    fontSize: 14,
    fontWeight: '600',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFCC00',
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#AAA',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  description: {
    color: '#CCC',
    fontSize: 14,
    lineHeight: 20,
  },
  sizeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#141414',
  },
  sizeButtonActive: {
    backgroundColor: '#FFCC00',
    borderColor: '#FFCC00',
  },
  sizeText: {
    color: '#AAA',
    fontWeight: 'bold',
  },
  sizeTextActive: {
    color: '#000',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  qtyBtn: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    color: '#FFCC00',
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addToCartBtn: {
    backgroundColor: '#FFCC00',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    backgroundColor: '#333',
  },
  addToCartText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});