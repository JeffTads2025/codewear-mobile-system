import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { PRODUCTS, Product } from '../data/products';
import { RootStackParamList } from '../routes';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const BANNERS = [
  { id: '1', title: 'Eleve seu <style>', subtitle: 'e dê um <Git push> na sua <view>' },
  { id: '2', title: 'Coleção Dev 2026', subtitle: 'Estampas exclusivas em algodão premium' },
  { id: '3', title: 'Frete Grátis Devs', subtitle: 'Em compras acima de R$ 150,00' },
];

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [cartQuantities, setCartQuantities] = useState<{ [key: string]: number }>({});
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQty, setModalQty] = useState(1);
  const [modalSize, setModalSize] = useState('M');

  const handleQuantityChange = (id: string, delta: number, maxStock: number) => {
    const current = cartQuantities[id] || 1;
    const next = current + delta;
    if (next >= 1 && next <= maxStock) {
      setCartQuantities((prev) => ({ ...prev, [id]: next }));
    }
  };

  const handleSelectSize = (id: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [id]: size }));
  };

  const handleOpenProductModal = (product: Product) => {
    setSelectedProduct(product);
    setModalQty(cartQuantities[product.id] || 1);
    setModalSize(selectedSizes[product.id] || 'M');
    setModalVisible(true);
  };

  const handleModalQuantity = (delta: number) => {
    if (!selectedProduct) return;
    const next = modalQty + delta;
    if (next >= 1 && next <= selectedProduct.stock) {
      setModalQty(next);
    }
  };

  const handleConfirmAddToCart = () => {
    if (!selectedProduct) return;
    setCartQuantities((prev) => ({ ...prev, [selectedProduct.id]: modalQty }));
    setSelectedSizes((prev) => ({ ...prev, [selectedProduct.id]: modalSize }));
    setModalVisible(false);
    alert(`Adicionado ao carrinho:\n${selectedProduct.name}\nTamanho: ${modalSize}\nQtd: ${modalQty}`);
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const qty = cartQuantities[item.id] || 1;
    const selectedSize = selectedSizes[item.id] || 'M';
    const isOutOfStock = item.stock === 0;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleOpenProductModal(item)}
          style={styles.imageContainer}
        >
          <Image
            source={{ uri: item.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <View style={styles.cardBody}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.stockBadgeContainer}>
            {isOutOfStock ? (
              <Text style={styles.outOfStock}>❌ Esgotado</Text>
            ) : (
              <Text style={styles.inStock}>✅ Disp: {item.stock} un</Text>
            )}
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          <Text style={styles.sizeLabel}>Tamanho:</Text>
          <View style={styles.sizeContainer}>
            {item.sizes.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.sizeButton,
                  selectedSize === s && styles.sizeButtonActive,
                ]}
                onPress={() => handleSelectSize(item.id, s)}
              >
                <Text
                  style={[
                    styles.sizeText,
                    selectedSize === s && styles.sizeTextActive,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actionRow}>
            <View style={styles.qtyControl}>
              <TouchableOpacity
                onPress={() => handleQuantityChange(item.id, -1, item.stock)}
                disabled={isOutOfStock}
              >
                <Text style={styles.qtyBtn}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{isOutOfStock ? 0 : qty}</Text>
              <TouchableOpacity
                onPress={() => handleQuantityChange(item.id, 1, item.stock)}
                disabled={isOutOfStock}
              >
                <Text style={styles.qtyBtn}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.buyBtn, isOutOfStock && styles.buyBtnDisabled]}
              disabled={isOutOfStock}
              onPress={() => alert(`Adicionado: ${item.name} (${selectedSize}) x${qty}`)}
            >
              <Text style={styles.buyBtnText}>
                {isOutOfStock ? 'Limite' : '🛒 Comprar'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.price}>R$ {item.price.toFixed(2).replace('.', ',')}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <Text style={styles.logoTag}>&lt;DEV/&gt;</Text>
            <Text style={styles.logoText}>CodeWear</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Produtos */}
        <FlatList
          data={PRODUCTS}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={renderProduct}
          ListHeaderComponent={
            <>
              {/* Carrossel de Banners */}
              <View style={styles.carouselWrapper}>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={(e) => {
                    const offset = e.nativeEvent.contentOffset.x;
                    const index = Math.round(offset / 280);
                    setActiveBannerIndex(index);
                  }}
                  scrollEventThrottle={16}
                >
                  {BANNERS.map((banner) => (
                    <View key={banner.id} style={styles.bannerCard}>
                      <Text style={styles.bannerTitle}>{banner.title}</Text>
                      <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                    </View>
                  ))}
                </ScrollView>

                {/* Dots Indicadores */}
                <View style={styles.dotsContainer}>
                  {BANNERS.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        activeBannerIndex === i && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              </View>

              <Text style={styles.sectionTitle}>Produtos em Destaque</Text>
            </>
          }
        />

        {/* Modal */}
        <Modal
          visible={modalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>

              {selectedProduct && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalImageContainer}>
                    <Image
                      source={{ uri: selectedProduct.image }}
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                  </View>

                  <Text style={styles.modalTitle}>{selectedProduct.name}</Text>

                  <View style={styles.stockBadgeContainer}>
                    {selectedProduct.stock === 0 ? (
                      <Text style={styles.outOfStock}>❌ Produto Esgotado</Text>
                    ) : (
                      <Text style={styles.inStock}>
                        ✅ Em Estoque: {selectedProduct.stock} unidades
                      </Text>
                    )}
                  </View>

                  <Text style={styles.modalDescription}>
                    {selectedProduct.description}
                  </Text>

                  <Text style={styles.modalSectionLabel}>Selecione o Tamanho:</Text>
                  <View style={styles.modalSizeRow}>
                    {selectedProduct.sizes.map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.modalSizeBtn,
                          modalSize === s && styles.modalSizeBtnActive,
                        ]}
                        onPress={() => setModalSize(s)}
                      >
                        <Text
                          style={[
                            styles.modalSizeText,
                            modalSize === s && styles.modalSizeTextActive,
                          ]}
                        >
                          {s}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.modalSectionLabel}>Quantidade:</Text>
                  <View style={styles.modalQtyRow}>
                    <TouchableOpacity
                      style={styles.modalQtyBtn}
                      onPress={() => handleModalQuantity(-1)}
                      disabled={selectedProduct.stock === 0}
                    >
                      <Text style={styles.modalQtyBtnText}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.modalQtyText}>
                      {selectedProduct.stock === 0 ? 0 : modalQty}
                    </Text>

                    <TouchableOpacity
                      style={styles.modalQtyBtn}
                      onPress={() => handleModalQuantity(1)}
                      disabled={selectedProduct.stock === 0}
                    >
                      <Text style={styles.modalQtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.modalPrice}>
                    R$ {selectedProduct.price.toFixed(2).replace('.', ',')}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.modalAddBtn,
                      selectedProduct.stock === 0 && styles.buyBtnDisabled,
                    ]}
                    disabled={selectedProduct.stock === 0}
                    onPress={handleConfirmAddToCart}
                  >
                    <Text style={styles.modalAddBtnText}>
                      {selectedProduct.stock === 0 ? 'Indisponível' : '🛒 Adicionar ao Carrinho'}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoTag: {
    backgroundColor: '#00E676',
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  logoutText: {
    color: '#FFCC00',
    fontWeight: 'bold',
  },
  carouselWrapper: {
    marginBottom: 20,
  },
  bannerCard: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginRight: 12,
    width: 280,
    height: 105,
    justifyContent: 'center',
  },
  bannerTitle: {
    color: '#FFCC00',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  bannerSubtitle: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
  },
  dotActive: {
    backgroundColor: '#FFCC00',
    width: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
    width: '48.5%',
    marginBottom: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderColor: '#2A2A2A',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 160,
  },
  cardBody: {
    padding: 12,
  },
  productTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    height: 36,
  },
  stockBadgeContainer: {
    marginVertical: 4,
  },
  inStock: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '600',
  },
  outOfStock: {
    color: '#FF5252',
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    color: '#888',
    fontSize: 11,
    height: 30,
    marginBottom: 6,
  },
  sizeLabel: {
    color: '#AAA',
    fontSize: 10,
    marginBottom: 4,
  },
  sizeContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10,
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#0F0F0F',
  },
  sizeButtonActive: {
    backgroundColor: '#FFCC00',
    borderColor: '#FFCC00',
  },
  sizeText: {
    color: '#AAA',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sizeTextActive: {
    color: '#000',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 6,
  },
  qtyBtn: {
    color: '#FFCC00',
    fontSize: 14,
    fontWeight: 'bold',
  },
  qtyText: {
    color: '#FFF',
    fontSize: 12,
  },
  buyBtn: {
    flex: 1,
    backgroundColor: '#FFCC00',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  buyBtnDisabled: {
    backgroundColor: '#2A2A2A',
  },
  buyBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 11,
  },
  price: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 450,
    maxHeight: '85%',
  },
  modalCloseBtn: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  modalCloseText: {
    color: '#888',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalImageContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    marginBottom: 16,
  },
  modalImage: {
    width: '100%',
    height: 220,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  modalDescription: {
    color: '#AAA',
    fontSize: 13,
    marginVertical: 10,
    lineHeight: 18,
  },
  modalSectionLabel: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  modalSizeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalSizeBtn: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0F0F0F',
  },
  modalSizeBtnActive: {
    backgroundColor: '#FFCC00',
    borderColor: '#FFCC00',
  },
  modalSizeText: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalSizeTextActive: {
    color: '#000',
  },
  modalQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  modalQtyBtn: {
    backgroundColor: '#222',
    borderRadius: 6,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalQtyBtnText: {
    color: '#FFCC00',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalQtyText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalPrice: {
    color: '#FFCC00',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'right',
  },
  modalAddBtn: {
    backgroundColor: '#FFCC00',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  modalAddBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 15,
  },
});