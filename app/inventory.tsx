// app/inventory.tsx
import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { router } from 'expo-router'

export default function InventoryHomeScreen() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '900' }}>📦 Inventario Help Desk</Text>
      <Text style={{ opacity: 0.8 }}>
        Control de los equipos del cuarto de Help Desk: fotos, cantidades, estados y
        categorías.
      </Text>

      <Pressable
        onPress={() => router.push('/inventory/index')}
        style={{ padding: 14, borderWidth: 1, borderRadius: 12, alignItems: 'center' }}
      >
        <Text>📋 Ver inventario</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/inventory/new')}
        style={{ padding: 14, borderWidth: 1, borderRadius: 12, alignItems: 'center' }}
      >
        <Text>➕ Nuevo equipo</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/inventory/categories')}
        style={{ padding: 14, borderWidth: 1, borderRadius: 12, alignItems: 'center' }}
      >
        <Text>🏷️ Categorías</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/inventory/locations')}
        style={{ padding: 14, borderWidth: 1, borderRadius: 12, alignItems: 'center' }}
      >
        <Text>📍 Ubicaciones</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/inventory/reports')}
        style={{ padding: 14, borderWidth: 1, borderRadius: 12, alignItems: 'center' }}
      >
        <Text>📊 Reportes</Text>
      </Pressable>
    </View>
  )
}
