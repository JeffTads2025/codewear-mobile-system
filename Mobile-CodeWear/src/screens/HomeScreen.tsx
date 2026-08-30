import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Animated,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Product } from '../data/products';
import { api, getApiAssetUrl } from '../services/api';
import { RootStackParamList } from '../routes';
import { useCart } from '../context/CartContext';
import { sortSizes } from '../utils/sizes';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

function ZoomImage({ source, style, onError }: { source: any; style: any; onError?: () => void }) {
  const scale = React.useRef(new Animated.Value(1)).current;
  return (
    <PinchGestureHandler
      onGestureEvent={Animated.event([{ nativeEvent: { scale } }], { useNativeDriver: true })}
      onHandlerStateChange={({ nativeEvent }) => {
        if (nativeEvent.state === State.END) Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
      }}
    >
      <Animated.View style={{ overflow: 'hidden' }}>
        <Animated.Image
          source={source}
          style={[style, { transform: [{ scale }] }]}
          resizeMode="cover"
          onError={onError}
        />
      </Animated.View>
    </PinchGestureHandler>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { addToCart, cartCount } = useCart();
  const { isAuthenticated, signOut } = useAuth();
  const { width: windowWidth } = useWindowDimensions();

  const isMobile = windowWidth < 600;
  const cardWidth = isMobile ? (windowWidth - 34) / 2 : '48.5%';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const loadProducts = useCallback(async () => {
    try {
      const response = await api.get<{ products: Product[] } | Product[]>('products?limit=100');
      const productsFromApi = Array.isArray(response.data)
        ? response.data
        : response.data.products;

      setProducts(productsFromApi.map((product) => ({
        ...product,
        image: getApiAssetUrl(product.image ?? product.image_url),
        description: product.description ?? product.descricao,
        sizes: product.sizes?.length ? product.sizes : ['P', 'M', 'G', 'GG'],
      })));
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível carregar os produtos.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadProducts();
    api.get('me').then(({ data }) => setProfile(data)).catch(() => undefined);
  }, [loadProducts]));

  const avatarUrl = getApiAssetUrl(profile?.avatarUrl);
  const avatarSource = avatarUrl ? { uri: avatarUrl } : undefined;

  const stockedProducts = products.filter((product) => Number(product.stock ?? product.estoque ?? 0) > 0);

  useEffect(() => {
    if (stockedProducts.length < 2) return;
    const timer = setInterval(() => setCarouselIndex((current) => (current + 1) % stockedProducts.length), 3500);
    return () => clearInterval(timer);
  }, [stockedProducts.length]);

  const handleSelectSize = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    const product = products.find((item) => String(item.id) === productId);
    const selectedSize = selectedSizes[productId] || 'M';
    const selectedSizeRecord = product?.sizes?.find((size) => typeof size !== 'string' && size.size === selectedSize);
    const availableStock = selectedSizeRecord && typeof selectedSizeRecord !== 'string'
      ? selectedSizeRecord.stock
      : Number(product?.stock ?? product?.estoque ?? 0);
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = current + delta;
      return { ...prev, [productId]: Math.max(1, Math.min(next, availableStock || 1)) };
    });
  };

  const handleBuy = (product: Product) => {
    if (!isAuthenticated) {
      Toast.show({ type: 'info', text1: 'Faça login para comprar', text2: 'Entre na sua conta antes de acessar o carrinho.' });
      navigation.navigate('Login');
      return;
    }
    const size = selectedSizes[product.id] || 'M';
    const stock = Number(product.stock ?? product.estoque ?? 0);
    const qty = Math.min(quantities[product.id] || 1, stock);
    addToCart(product, size, qty);
    navigation.navigate('Cart');
  };

  const getImageSource = (image: any) => {
    if (typeof image === 'string') {
      const imageUrl = getApiAssetUrl(image);
      if (failedImages.has(imageUrl || '')) {
        return { uri: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%23222%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2212%22%3EImagem não disponível%3C/text%3E%3C/svg%3E' };
      }
      return { uri: imageUrl };
    }
    return image;
  };

  const handleLogout = async () => {
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const requireLogin = () => {
    if (isAuthenticated) return true;
    Toast.show({ type: 'info', text1: 'Faça login para continuar', text2: 'Esta área é exclusiva para clientes autenticados.' });
    navigation.navigate('Login');
    return false;
  };

  const handleImageError = (imageUrl?: string) => {
    if (imageUrl) {
      setFailedImages(prev => new Set(prev).add(imageUrl));
      console.warn('Erro ao carregar imagem:', imageUrl);
    }
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <StatusBar backgroundColor="#0A0A0A" barStyle="light-content" translucent={false} />
      <View style={styles.brandBar}>
        <Text style={styles.brandBarSymbol}>{'</>'}</Text>
        <Text style={styles.brandBarTitle}>CodeWear</Text>
      </View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.headerLeft}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <Text style={styles.greeting} numberOfLines={1}>
            Olá, {profile?.name?.split(' ')[0] || 'cliente'} !
          </Text>

          <TouchableOpacity onPress={() => requireLogin() && navigation.navigate('Profile')}>
            {avatarSource ? (
              <Image source={avatarSource} style={styles.headerAvatar as any} />
            ) : (
              <View style={styles.headerAvatarFallback}>
                <Text style={styles.avatarText}>
                  {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => requireLogin() && navigation.navigate('Cart')}
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
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.carousel}
          disabled={!stockedProducts.length}
          onPress={() => {
            if (stockedProducts.length && requireLogin()) {
              navigation.navigate('ProductDetail', {
                product: stockedProducts[carouselIndex],
              });
            }
          }}
        >
          {stockedProducts.length ? (
            <>
              <Image
                source={getImageSource(
                  stockedProducts[carouselIndex % stockedProducts.length].image ??
                  stockedProducts[carouselIndex % stockedProducts.length].image_url
                )}
                style={styles.carouselImage}
                resizeMode="cover"
              />
              <View style={styles.carouselCaption}>
              </View>
            </>
          ) : (
            <Text style={styles.bannerSubtitle}>Nenhum produto em estoque</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Text style={styles.sectionTitle}>Produtos em Destaque</Text>

        <View style={styles.gridContainer}>
          {loading ? (
            <ActivityIndicator color="#FFCC00" size="large" />
          ) : products.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum produto cadastrado.</Text>
          ) : (
            products.map((item) => {
              const productId = String(item.id);
              const price = Number(item.price ?? item.preco ?? 0);
              const stock = Number(item.stock ?? item.estoque ?? 0);
              const isOutOfStock = stock === 0;
              const currentSize = selectedSizes[productId] || 'M';
              const currentQty = quantities[item.id] || (isOutOfStock ? 0 : 1);
              const activePromotion = item.promotions?.find((promotion) => promotion.isActive);

              return (
                <View key={item.id} style={[styles.productCard, { width: cardWidth }]}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => requireLogin() && navigation.navigate('ProductDetail', { product: item })}
                  >
                    <Image
                      source={getImageSource(item.image ?? item.image_url)}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>

                  <View style={styles.cardDetails}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.name}
                    </Text>

                    <View style={styles.promotionSlot}>
                      {activePromotion && (
                        <Text style={styles.promotionText}>
                          {Number(activePromotion.discountPercentage)}% OFF
                        </Text>
                      )}
                    </View>

                    {isOutOfStock ? (
                      <Text style={styles.outOfStockText}>❌ Esgotado</Text>
                    ) : (
                      <Text style={styles.inStockText}>✅ Disp: {stock} un</Text>
                    )}

                    <Text style={styles.productDescription} numberOfLines={2}>
                      {item.description ||
                        'Tamanho único - Unissex. Algodão 100% penteado super macio.'}
                    </Text>

                    <Text style={styles.sizeLabel}>Tamanho:</Text>
                    <View style={styles.sizeRow}>
                      {sortSizes(item.sizes || ['P', 'M', 'G', 'GG']).map((size) => {
                        const sizeName = typeof size === 'string' ? size : size.size;
                        const isSelected = currentSize === sizeName;
                        return (
                          <TouchableOpacity
                            key={sizeName}
                            style={[
                              styles.sizeBtn,
                              isSelected && styles.sizeBtnSelected,
                            ]}
                            onPress={() => handleSelectSize(productId, sizeName)}
                            disabled={isOutOfStock}
                          >
                            <Text
                              style={[
                                styles.sizeBtnText,
                                isSelected && styles.sizeBtnTextSelected,
                              ]}
                            >
                              {sizeName}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <View style={styles.cardFooter}>
                      <Text style={styles.productPrice} numberOfLines={1}>
                        R$ {price.toFixed(2).replace('.', ',')}
                      </Text>

                      <View style={styles.actionsContainerMobile}>
                        <View style={styles.qtyControlMobile}>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => handleQuantityChange(productId, -1)}
                            disabled={isOutOfStock}
                          >
                            <Text style={styles.qtyBtnText}>-</Text>
                          </TouchableOpacity>

                          <Text style={styles.qtyText}>{currentQty}</Text>

                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => handleQuantityChange(productId, 1)}
                            disabled={isOutOfStock}
                          >
                            <Text style={styles.qtyBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>

                        {isOutOfStock ? (
                          <View style={[styles.buyBtnMobile, styles.buyBtnDisabled]}>
                            <Text style={styles.buyBtnTextDisabled}>Indisponível</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.buyBtnMobile}
                            onPress={() => handleBuy(item)}
                          >
                            <Text style={styles.buyBtnText}>Comprar</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.menuPanel}
          >
            <TouchableOpacity onPress={() => setMenuOpen(false)} style={styles.menuHeader}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                requireLogin() && navigation.navigate('Profile');
              }}
            >
              <Text style={styles.menuText}>Meu perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                requireLogin() && navigation.navigate('Orders');
              }}
            >
              <Text style={styles.menuText}>Meus pedidos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                requireLogin() && navigation.navigate('Cart');
              }}
            >
              <Text style={styles.menuText}>Carrinho</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                requireLogin() && navigation.navigate('Contact');
              }}
            >
              <Text style={styles.menuText}>Contato</Text>
            </TouchableOpacity>
            {profile?.role === 'admin' && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  requireLogin() && navigation.navigate('AdminApp');
                }}
              >
                <Text style={styles.menuText}>Administração</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                handleLogout();
              }}
            >
              <Text style={styles.menuText}>Sair</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 40,
  },
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#0A0A0A',
  },
  brandBarSymbol: {
    color: '#C0C0C0',
    fontWeight: 'bold',
    fontSize: 21,
  },
  brandBarTitle: {
    color: '#C0C0C0',
    fontSize: 21,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minHeight: 56,
    paddingHorizontal: 8,
    gap: 8,
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerLeft: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    color: '#ffcc00',
    fontSize: 12,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuIcon: {
    color: '#ffcc00',
    fontSize: 22,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19
  },
  headerAvatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffcc00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14
  },
  cartButton: {
    position: 'relative',
    padding: 6,
  },
  cartIcon: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 15,
    height: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  menuPanel: {
    width: 260,
    height: '100%',
    backgroundColor: '#171717',
    padding: 16,
  },
  menuHeader: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2b2b2b',
    alignItems: 'flex-start',
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#2b2b2b',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  menuText: {
    color: '#fff',
    fontSize: 16
  },
  carousel: { height: 180, borderRadius: 10, overflow: 'hidden', backgroundColor: '#161616', marginBottom: 24, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  carouselImage: { width: '100%', height: 180 },
  carouselCaption: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 10, backgroundColor: 'rgba(0,0,0,0.62)' },
  bannerTitle: {
    color: '#FFCC00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bannerSubtitle: {
    color: '#888',
    fontSize: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
  },
  dotActive: {
    width: 16,
    backgroundColor: '#FFCC00',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  productCard: {
    backgroundColor: '#141414',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
    height: 460,
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#1E1E1E',
  },
  cardDetails: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  productName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
    minHeight: 32,
  },
  inStockText: {
    color: '#00E676',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  outOfStockText: {
    color: '#FF5252',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productDescription: {
    color: '#888',
    fontSize: 10,
    marginBottom: 6,
    lineHeight: 13,
    height: 26,
  },
  sizeLabel: {
    color: '#AAA',
    fontSize: 10,
    marginBottom: 4,
  },
  sizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginBottom: 8,
  },
  sizeBtn: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sizeBtnSelected: {
    backgroundColor: '#FFCC00',
    borderColor: '#FFCC00',
  },
  sizeBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sizeBtnTextSelected: {
    color: '#000',
  },
  productPrice: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardFooter: {
    marginTop: 8,
  },
  actionsContainerMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 6,
  },
  qtyControlMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: '100%',
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
    fontSize: 12,
  },
  buyBtnMobile: {
    width: '100%',
    backgroundColor: '#FFCC00',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtnDisabled: {
    backgroundColor: '#2A2A2A',
  },
  buyBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  buyBtnTextDisabled: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyText: {
    color: '#aaa',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 24,
  },
  promotionText: {
    color: '#00E676',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  promotionSlot: {
    height: 16,
  },
});