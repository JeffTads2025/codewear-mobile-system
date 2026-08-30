import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { api, validateCoupon } from '../services/api';
import Toast from 'react-native-toast-message';

export function CartScreen() {
  const navigation = useNavigation();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  // Estados do Cupom de Desconto
  const [couponCode, setCouponCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('pix');
  const [address, setAddress] = useState('');

  React.useEffect(() => {
    api.get('me')
      .then(({ data }) => setAddress(data.address || ''))
      .catch(() => undefined);
  }, []);

  // Subtotal sem desconto
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product.price ?? item.product.preco ?? 0) * item.quantity,
    0
  );

  // Cálculo do desconto e total final
  const discountAmount = (subtotal * discountPercentage) / 100;
  const totalAmount = subtotal - discountAmount;

  const getImageSource = (image: string | undefined) => {
    if (image && image.trim() !== '') {
      return { uri: image };
    }
    return { uri: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500' };
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Toast.show({ type: 'info', text1: 'Atenção', text2: 'Digite o código do cupom.' });
      return;
    }

    try {
      setLoadingCoupon(true);
      const response = await validateCoupon(couponCode.trim());

      setDiscountPercentage(response.coupon.discountPercentage);
      setAppliedCoupon(response.coupon.code);
      Toast.show({ type: 'success', text1: 'Cupom aplicado', text2: `${response.coupon.discountPercentage}% de desconto.` });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message ?? 'Cupom inválido ou expirado.';
      Toast.show({ type: 'error', text1: 'Cupom inválido', text2: msg });
    } finally {
      setLoadingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscountPercentage(0);
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleFinishPurchase = async () => {
    try {
      setLoadingPurchase(true);

      for (const item of cartItems) {
        await api.post('cart', {
          productId: Number(item.product.id),
          quantity: item.quantity,
          size: item.size,
        });
      }

      if (!address.trim()) {
        Toast.show({ type: 'info', text1: 'Endereço obrigatório', text2: 'Informe o endereço de entrega.' });
        return;
      }

      await api.post('checkout', {
        paymentMethod,
        address: address.trim(),
        couponCode: appliedCoupon,
      });
      Toast.show({ type: 'success', text1: 'Compra realizada', text2: 'Seu pedido foi criado com sucesso.' });
      clearCart();
      navigation.navigate('Home' as never);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Erro na compra', text2: error.response?.data?.message || 'Não foi possível finalizar a compra.' });
    } finally {
      setLoadingPurchase(false);
    }
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.container}>
        {/* Botão de Voltar */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Continuar Comprando</Text>
        </TouchableOpacity>

        {/* Título */}
        <Text style={styles.title}>Seu Carrinho 🛒</Text>

        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Seu carrinho está vazio.</Text>
          </View>
        ) : (
          <>
            <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
              {cartItems.map((item) => {
                const itemPrice = Number(item.product.price ?? item.product.preco ?? 0);

                // Priorizando a propriedade 'image' com fallback seguro
                const itemImage = item.product.image || item.product.image_url || item.product.imagemUrl;
                const productIdString = String(item.product.id);

                return (
                  <View key={`${item.product.id}-${item.size}`} style={styles.cartCard}>
                    {/* Imagem */}
                    <Image
                      source={getImageSource(itemImage)}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />

                    {/* Detalhes do Produto */}
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.product.name ?? item.product.nome ?? 'Produto'}</Text>
                      <Text style={styles.itemSize}>Tamanho: {item.size}</Text>
                      <Text style={styles.itemPrice} numberOfLines={1}>
                        R$ {itemPrice.toFixed(2).replace('.', ',')}
                      </Text>

                      {/* Controles de Quantidade */}
                      <View style={styles.qtyContainer}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() =>
                            updateQuantity(
                              productIdString,
                              item.size,
                              -1
                            )
                          }
                        >
                          <Text style={styles.qtyBtnText}>-</Text>
                        </TouchableOpacity>

                        <Text style={styles.qtyValue}>{item.quantity}</Text>

                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() =>
                            updateQuantity(
                              productIdString,
                              item.size,
                              1
                            )
                          }
                        >
                          <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Botão Remover */}
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeFromCart(productIdString, item.size)}
                    >
                      <Text style={styles.removeBtnText}>🗑 Rem</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>

            {/* Rodapé / Cupom e Total */}
            <View style={styles.footer}>
              <Text style={styles.checkoutSectionTitle}>Forma de pagamento</Text>
              <View style={styles.paymentRow}>
                {(['pix', 'cartao'] as const).map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[styles.paymentButton, paymentMethod === method && styles.paymentButtonSelected]}
                    onPress={() => setPaymentMethod(method)}
                  >
                    <Text style={paymentMethod === method ? styles.paymentTextSelected : styles.paymentText}>
                      {method === 'pix' ? 'PIX' : 'Cartão'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.checkoutSectionTitle}>Endereço de entrega</Text>
              <TextInput
                style={styles.addressInput}
                placeholder="Rua, número, bairro e cidade"
                placeholderTextColor="#666"
                value={address}
                onChangeText={setAddress}
                multiline
              />

              {/* Área do Cupom de Desconto */}
              <View style={styles.couponContainer}>
                {appliedCoupon ? (
                  <View style={styles.appliedCouponRow}>
                    <Text style={styles.appliedCouponText}>
                      🏷️ Cupom <Text style={styles.boldText}>{appliedCoupon}</Text> ({discountPercentage}% OFF)
                    </Text>
                    <TouchableOpacity onPress={handleRemoveCoupon}>
                      <Text style={styles.removeCouponText}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.couponInputRow}>
                    <TextInput
                      style={styles.couponInput}
                      placeholder="Cupom de desconto"
                      placeholderTextColor="#666"
                      value={couponCode}
                      onChangeText={setCouponCode}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity
                      style={styles.couponBtn}
                      onPress={handleApplyCoupon}
                      disabled={loadingCoupon}
                    >
                      {loadingCoupon ? (
                        <ActivityIndicator color="#000" size="small" />
                      ) : (
                        <Text style={styles.couponBtnText}>Aplicar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Detalhamento de Valores */}
              {discountPercentage > 0 && (
                <>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal:</Text>
                    <Text style={styles.summaryValue} numberOfLines={1}>
                      R$ {subtotal.toFixed(2).replace('.', ',')}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.discountLabel}>Desconto ({discountPercentage}%):</Text>
                    <Text style={styles.discountValue} numberOfLines={1}>
                      - R$ {discountAmount.toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                </>
              )}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total do Pedido:</Text>
                <Text style={styles.totalValue} numberOfLines={1}>
                  R$ {totalAmount.toFixed(2).replace('.', ',')}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={handleFinishPurchase}
                disabled={loadingPurchase}
              >
                {loadingPurchase ? <ActivityIndicator color="#000" /> : <Text style={styles.checkoutBtnText}>Finalizar Compra</Text>}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 960,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FFCC00',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  itemsList: {
    flex: 1,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    marginRight: 14,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemSize: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  itemPrice: {
    color: '#FFCC00',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 8,
  },
  qtyBtn: {
    paddingHorizontal: 4,
  },
  qtyBtnText: {
    color: '#FFCC00',
    fontSize: 14,
    fontWeight: 'bold',
  },
  qtyValue: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  removeBtn: {
    padding: 8,
  },
  removeBtnText: {
    color: '#FF5252',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#222',
    paddingTop: 16,
    marginTop: 10,
  },
  couponContainer: {
    marginBottom: 16,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFF',
    fontSize: 14,
  },
  couponBtn: {
    backgroundColor: '#FFCC00',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  appliedCouponRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    borderRadius: 8,
  },
  appliedCouponText: {
    color: '#38BDF8',
    fontSize: 14,
  },
  boldText: {
    fontWeight: 'bold',
  },
  removeCouponText: {
    color: '#FF5252',
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    color: '#AAA',
    fontSize: 14,
  },
  summaryValue: {
    color: '#FFF',
    fontSize: 14,
  },
  discountLabel: {
    color: '#00E676',
    fontSize: 14,
  },
  discountValue: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  totalLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#FFCC00',
    fontSize: 22,
    fontWeight: 'bold',
  },
  checkoutBtn: {
    backgroundColor: '#FFCC00',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkoutSectionTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 8, marginTop: 12 },
  paymentRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  paymentButton: { flex: 1, borderWidth: 1, borderColor: '#444', borderRadius: 6, padding: 11, alignItems: 'center' },
  paymentButtonSelected: { borderColor: '#ffcc00', backgroundColor: '#2a260f' },
  paymentText: { color: '#aaa', fontWeight: 'bold' },
  paymentTextSelected: { color: '#ffcc00', fontWeight: 'bold' },
  addressInput: { backgroundColor: '#0d0d0d', borderWidth: 1, borderColor: '#2b2b2b', color: '#fff', borderRadius: 6, padding: 10, minHeight: 48 },
});