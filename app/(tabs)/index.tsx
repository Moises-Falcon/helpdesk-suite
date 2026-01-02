import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { router } from 'expo-router'

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 26, fontWeight: '800', marginBottom: 8 }}>🏠 Home</Text>
      <Text style={{ marginBottom: 16 }}>
        Bienvenido. Desde aquí puedes ir al módulo de Tickets.
      </Text>

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
    </View>
  )
}
