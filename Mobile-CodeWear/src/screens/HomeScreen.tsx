import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { PRODUCTS as products, Product } from '../data/products';
import { RootStackParamList } from '../routes';
import { useCart } from '../context/CartContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { addToCart, cartCount } = useCart();

  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const handleSelectSize = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = current + delta;
      return { ...prev, [productId]: next < 1 ? 1 : next };
    });
  };

  const handleBuy = (product: Product) => {
    const size = selectedSizes[product.id] || 'M';
    const qty = quantities[product.id] || 1;
    addToCart(product, size, qty);
    navigation.navigate('Cart');
  };

  const getImageSource = (image: any) => {
    if (typeof image === 'string') {
      return { uri: image };
    }
    return image;
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Topo / Header com Carrinho e Sair */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.devTag}>
              <Text style={styles.devTagText}>&lt;DEV/&gt;</Text>
            </View>
            <Text style={styles.logoTitle}>CodeWear</Text>
          </View>

          <View style={styles.rightHeaderActions}>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => navigation.navigate('Cart')}
            >
              <Text style={styles.cartIcon}>🛒</Text>
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Banners Promocionais em Carrossel */}
        <View style={styles.bannerRow}>
          <View style={styles.bannerCard}>
            <Text style={styles.bannerTitle}>
              Eleve seu <Text style={styles.bannerHighlight}>&lt;style&gt;</Text>
            </Text>
            <Text style={styles.bannerSubtitle}>
              e dê um &lt;Git push&gt; na sua &lt;view&gt;
            </Text>
          </View>

          <View style={styles.bannerCard}>
            <Text style={styles.bannerTitle}>Coleção Dev 2026</Text>
            <Text style={styles.bannerSubtitle}>
              Estampas exclusivas em algodão premium
            </Text>
          </View>
        </View>

        {/* Indicadores do Carrossel */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Título da Seção */}
        <Text style={styles.sectionTitle}>Produtos em Destaque</Text>

        {/* Lista de Produtos */}
        <View style={styles.gridContainer}>
          {products.map((item) => {
            const isOutOfStock = item.stock === 0;
            const currentSize = selectedSizes[item.id] || 'M';
            const currentQty = quantities[item.id] || (isOutOfStock ? 0 : 1);

            return (
              <View key={item.id} style={styles.productCard}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('ProductDetail', { product: item })}
                >
                  <Image
                    source={getImageSource(item.image)}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>

                <View style={styles.cardDetails}>
                  <Text style={styles.productName}>{item.name}</Text>

                  {isOutOfStock ? (
                    <Text style={styles.outOfStockText}>❌ Esgotado</Text>
                  ) : (
                    <Text style={styles.inStockText}>
                      ✅ Disp: {item.stock ?? 1} un
                    </Text>
                  )}

                  <Text style={styles.productDescription} numberOfLines={2}>
                    {item.description ||
                      'Tamanho único - Unissex. Algodão 100% penteado super macio.'}
                  </Text>

                  <Text style={styles.sizeLabel}>Tamanho:</Text>
                  <View style={styles.sizeRow}>
                    {['P', 'M', 'G', 'GG'].map((size) => {
                      const isSelected = currentSize === size;
                      return (
                        <TouchableOpacity
                          key={size}
                          style={[
                            styles.sizeBtn,
                            isSelected && styles.sizeBtnSelected,
                          ]}
                          onPress={() => handleSelectSize(item.id, size)}
                          disabled={isOutOfStock}
                        >
                          <Text
                            style={[
                              styles.sizeBtnText,
                              isSelected && styles.sizeBtnTextSelected,
                            ]}
                          >
                            {size}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.actionRow}>
                    <View style={styles.qtyControl}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleQuantityChange(item.id, -1)}
                        disabled={isOutOfStock}
                      >
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>

                      <Text style={styles.qtyText}>{currentQty}</Text>

                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleQuantityChange(item.id, 1)}
                        disabled={isOutOfStock}
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>

                    {isOutOfStock ? (
                      <View style={[styles.buyBtn, styles.buyBtnDisabled]}>
                        <Text style={styles.buyBtnTextDisabled}>Limite</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.buyBtn}
                        onPress={() => handleBuy(item)}
                      >
                        <Text style={styles.buyBtnText}>🛒 Comprar</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={styles.productPrice}>
                    R$ {item.price.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
  },
  scrollContainer: {
    width: '100%',
  },
  container: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  devTag: {
    backgroundColor: '#00E676',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  devTagText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 13,
  },
  logoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  rightHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  cartButton: {
    position: 'relative',
    padding: 4,
  },
  cartIcon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#FFCC00',
    fontWeight: 'bold',
    fontSize: 15,
  },
  bannerRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  bannerCard: {
    flex: 1,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    padding: 20,
    justifyContent: 'center',
  },
  bannerTitle: {
    color: '#FFCC00',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  bannerHighlight: {
    color: '#FFCC00',
  },
  bannerSubtitle: {
    color: '#888',
    fontSize: 13,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#FFCC00',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  productCard: {
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
    width: '48%',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#1E1E1E',
  },
  cardDetails: {
    padding: 16,
  },
  productName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inStockText: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  outOfStockText: {
    color: '#FF5252',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  productDescription: {
    color: '#888',
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  sizeLabel: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 6,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  sizeBtn: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sizeBtnSelected: {
    backgroundColor: '#FFCC00',
    borderColor: '#FFCC00',
  },
  sizeBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sizeBtnTextSelected: {
    color: '#000',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
  },
  qtyBtn: {
    paddingHorizontal: 4,
  },
  qtyBtnText: {
    color: '#FFCC00',
    fontWeight: 'bold',
    fontSize: 14,
  },
  qtyText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  buyBtn: {
    flex: 1,
    backgroundColor: '#FFCC00',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buyBtnDisabled: {
    backgroundColor: '#2A2A2A',
  },
  buyBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 13,
  },
  buyBtnTextDisabled: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 13,
  },
  productPrice: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});