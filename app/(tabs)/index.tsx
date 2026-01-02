// app/(tabs)/index.tsx
import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { router } from 'expo-router'

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 26, fontWeight: '800' }}>🏠 Home</Text>
      <Text>Desde aquí puedes ir al módulo de Tickets y al Inventario.</Text>

      <Pressable
        onPress={() => router.push('/tickets')}
        style={{
          paddingVertical: 16,
          paddingHorizontal: 12,
          borderWidth: 1,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        <Text>🎫 Ir a Tickets</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/inventory')}
        style={{
          paddingVertical: 16,
          paddingHorizontal: 12,
          borderWidth: 1,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        <Text>📦 Ir a Inventario</Text>
      </Pressable>
    </View>
  )
}
