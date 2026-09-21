import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { AdminSalesScreen } from '../screens/AdminSalesScreen';
import { AdminCustomersScreen } from '../screens/AdminCustomersScreen';
import { AdminAuditScreen } from '../screens/AdminAuditScreen';
import { HomeScreen } from '../screens/HomeScreen';

const Tab = createBottomTabNavigator();

export function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0d0d0d', borderTopColor: '#222' },
        tabBarActiveTintColor: '#0080ff',
        tabBarInactiveTintColor: '#666',
        tabBarIconStyle: { width: 20, height: 20 },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="CodeWear"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="shopping-cart" color={color} size={16} />
        }}
      />
      <Tab.Screen 
        name="PainelGeral" 
        component={AdminDashboardScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="shield" color={color} size={16} />
        }}
      />
      <Tab.Screen 
        name="Vendas" 
        component={AdminSalesScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="shopping-bag" color={color} size={16} />
        }}
      />
      <Tab.Screen 
        name="Clientes" 
        component={AdminCustomersScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="users" color={color} size={16} />
        }}
      />
      <Tab.Screen 
        name="Auditoria" 
        component={AdminAuditScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="activity" color={color} size={16} />
        }}
      />
    </Tab.Navigator>
  );
}