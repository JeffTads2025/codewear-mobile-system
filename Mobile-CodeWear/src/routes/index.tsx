import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigatorScreenParams } from '@react-navigation/native';

import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { Product } from '../data/products';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ContactScreen } from '../screens/ContactScreen';
import { useAuth } from '../context/AuthContext';
import { ClientTopTabs } from './ClientTopTabs';
import type { ClientTabParamList } from './ClientTopTabs';

// Import da navegação em abas do Administrador
import { AdminTopTabs } from './AdminTopTabs';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ClientApp: NavigatorScreenParams<ClientTabParamList> | undefined;
  ProductDetail: { product: Product };
  AdminApp: undefined; 
  Profile: undefined;
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
      initialRouteName="ClientApp"
    >
      {!isAuthenticated && <Stack.Screen name="Login" component={LoginScreen} options={{ gestureEnabled: false }} />}
      {!isAuthenticated && <Stack.Screen name="Register" component={RegisterScreen} />}
      <Stack.Screen name="ClientApp" component={ClientTopTabs} />
      {isAuthenticated && <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />}
      <Stack.Screen name="AdminApp" component={AdminTopTabs} />
      {isAuthenticated && <Stack.Screen name="Profile" component={ProfileScreen} />}
      {isAuthenticated && <Stack.Screen name="Contact" component={ContactScreen} />}
    </Stack.Navigator>
  );
}