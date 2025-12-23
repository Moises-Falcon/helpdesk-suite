// app/(tabs)/index.tsx
import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { router } from 'expo-router'

export default function HomeTab() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 26, fontWeight: '800' }}>🏠 Home</Text>
      <Text style={{ opacity: 0.75 }}>
        Bienvenido. Desde aquí puedes ir al módulo de Tickets.
      </Text>

      <Pressable
        // ✅ FIX: antes estaba /ticket/tickets (MAL)
        onPress={() => router.push('/tickets')}
        style={{ padding: 14, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
      >
        <Text>🎫 Ir a Tickets</Text>
      </Pressable>
    </View>
  )
}
