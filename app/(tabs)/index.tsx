// FILE: app/(tabs)/index.tsx
import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { router } from 'expo-router'

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>🏠 Home</Text>
      <Text style={{ opacity: 0.7 }}>
        Bienvenido. Desde aquí puedes ir al módulo de Tickets.
      </Text>

      <Pressable
        onPress={() => router.push('/ticket/tickets')}
        style={{ padding: 14, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
      >
        <Text>🎫 Ir a Tickets</Text>
      </Pressable>
    </View>
  )
}
