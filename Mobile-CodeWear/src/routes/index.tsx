import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { CartScreen } from '../screens/CartScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { Product } from '../data/products';
import { ProfileScreen } from '../screens/ProfileScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ContactScreen } from '../screens/ContactScreen';
import { useAuth } from '../context/AuthContext';

// Import da navegação em abas do Administrador
import { AdminTopTabs } from './AdminTopTabs';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Cart: undefined;
  ProductDetail: { product: Product };
  AdminApp: undefined; // Adicionado para o TypeScript reconhecer a rota do Admin
  Profile: undefined;
  Orders: undefined;
  Contact: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function Routes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
      initialRouteName={isAuthenticated ? 'Home' : 'Home'}
    >
      {!isAuthenticated && <Stack.Screen name="Login" component={LoginScreen} options={{ gestureEnabled: false }} />}
      {!isAuthenticated && <Stack.Screen name="Register" component={RegisterScreen} />}
      <Stack.Screen name="Home" component={HomeScreen} />
      {isAuthenticated && <Stack.Screen name="Cart" component={CartScreen} />}
      {isAuthenticated && <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />}
      {isAuthenticated && <Stack.Screen name="AdminApp" component={AdminTopTabs} />}
      {isAuthenticated && <Stack.Screen name="Profile" component={ProfileScreen} />}
      {isAuthenticated && <Stack.Screen name="Orders" component={OrdersScreen} />}
      {isAuthenticated && <Stack.Screen name="Contact" component={ContactScreen} />}
    </Stack.Navigator>
  );
}