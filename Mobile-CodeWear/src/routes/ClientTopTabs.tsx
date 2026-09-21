import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { HomeScreen } from '../screens/HomeScreen';
import { CartScreen } from '../screens/CartScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '.';

export type ClientTabParamList = {
    Home: undefined;
    Cart: undefined;
    Orders: undefined;
};

const Tab = createMaterialTopTabNavigator<ClientTabParamList>();

export function ClientTopTabs() {
    const { isAuthenticated } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const requireLogin = () => {
        if (isAuthenticated) return true;
        Toast.show({ type: 'info', text1: 'Faça login para continuar', text2: 'Esta área é exclusiva para clientes autenticados.' });
        navigation.navigate('Login');
        return false;
    };

    return (
        <Tab.Navigator
            tabBarPosition="bottom"
            screenOptions={{
                tabBarStyle: { backgroundColor: '#0d0d0d', borderTopColor: '#222', borderTopWidth: 1, height: 52 },
                tabBarActiveTintColor: '#0080ff',
                tabBarInactiveTintColor: '#666',
                tabBarShowLabel: false,
                tabBarIndicatorStyle: { backgroundColor: '#0080ff', top: 0 },
                swipeEnabled: true,
                lazy: true,
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Feather name="home" color={color} size={20} /> }} />

            <Tab.Screen
                name="Cart"
                component={CartScreen}
                options={{ tabBarIcon: ({ color }) => <Feather name="shopping-cart" color={color} size={20} /> }}
                listeners={{ tabPress: (event) => { if (!requireLogin()) event.preventDefault(); } }}
            />
            <Tab.Screen
                name="Orders"
                component={OrdersScreen}
                options={{ tabBarIcon: ({ color }) => <Feather name="shopping-bag" color={color} size={20} /> }}
                listeners={{ tabPress: (event) => { if (!requireLogin()) event.preventDefault(); } }}
            />

        </Tab.Navigator>
    );
}