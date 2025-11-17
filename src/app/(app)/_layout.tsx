import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '@theme/index';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();

export default function AppLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.gray[200],
          backgroundColor: colors.white,
          paddingBottom: 5,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="pos"
        options={{
          title: 'POS',
          tabBarLabel: 'Venta',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🛍️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="inventory"
        options={{
          title: 'Inventario',
          tabBarLabel: 'Inventario',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📦</Text>
          ),
        }}
      />
      <Tab.Screen
        name="cash"
        options={{
          title: 'Caja',
          tabBarLabel: 'Caja',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>💰</Text>
          ),
        }}
      />
      <Tab.Screen
        name="more"
        options={{
          title: 'Más',
          tabBarLabel: 'Más',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>⋯</Text>
          ),
        }}
      />
      <Tab.Screen
        name="yape"
        options={{
          title: 'Pagos',
          tabBarLabel: 'Pagos',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>💳</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
