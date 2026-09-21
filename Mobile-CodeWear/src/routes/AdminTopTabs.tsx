import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Feather } from '@expo/vector-icons';

import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { AdminSalesScreen } from '../screens/AdminSalesScreen';
import { AdminCustomersScreen } from '../screens/AdminCustomersScreen';
import { AdminAuditScreen } from '../screens/AdminAuditScreen';
import { HomeScreen } from '../screens/HomeScreen';

const Tab = createMaterialTopTabNavigator();

export function AdminTopTabs() {
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
      <Tab.Screen
        name="CodeWear"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Feather name="shopping-cart" color={color} size={20} />
        }}
      />
      <Tab.Screen
        name="PainelGeral"
        component={AdminDashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <Feather name="shield" color={color} size={20} />
        }}
      />
      <Tab.Screen
        name="Vendas"
        component={AdminSalesScreen}
        options={{
          tabBarIcon: ({ color }) => <Feather name="shopping-bag" color={color} size={20} />
        }}
      />
      <Tab.Screen
        name="Clientes"
        component={AdminCustomersScreen}
        options={{
          tabBarIcon: ({ color }) => <Feather name="users" color={color} size={20} />
        }}
      />
      <Tab.Screen
        name="Auditoria"
        component={AdminAuditScreen}
        options={{
          tabBarIcon: ({ color }) => <Feather name="activity" color={color} size={20} />
        }}
      />
    </Tab.Navigator>
  );
}
