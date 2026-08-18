import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';

export function CartScreen() {
  const navigation = useNavigation();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  // Cálculo dinâmico do valor total
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const getImageSource = (image: any) => {
    if (typeof image === 'string') {
      return { uri: image };
    }
    return image;
  };

  const handleFinishPurchase = () => {
    alert('Compra realizada com sucesso!');
    clearCart();
    navigation.navigate('Home' as never);
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
              {cartItems.map((item) => (
                <View key={`${item.product.id}-${item.size}`} style={styles.cartCard}>
                  {/* Imagem */}
                  <Image
                    source={getImageSource(item.product.image)}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />

                  {/* Detalhes do Produto */}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.product.name}</Text>
                    <Text style={styles.itemSize}>Tamanho: {item.size}</Text>
                    <Text style={styles.itemPrice}>
                      R$ {item.product.price.toFixed(2).replace('.', ',')}
                    </Text>

                    {/* Controles de Quantidade */}
                    <View style={styles.qtyContainer}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() =>
                          updateQuantity(
                            item.product.id,
                            item.size,
                            item.quantity - 1
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
                            item.product.id,
                            item.size,
                            item.quantity + 1
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
                    onPress={() => removeFromCart(item.product.id, item.size)}
                  >
                    <Text style={styles.removeBtnText}>🗑 Rem</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Rodapé / Total */}
            <View style={styles.footer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total do Pedido:</Text>
                <Text style={styles.totalValue}>
                  R$ {totalAmount.toFixed(2).replace('.', ',')}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={handleFinishPurchase}
              >
                <Text style={styles.checkoutBtnText}>Finalizar Compra</Text>
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    color: '#888',
    fontSize: 16,
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
});