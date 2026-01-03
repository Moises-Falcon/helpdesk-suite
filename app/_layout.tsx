// app/_layout.tsx
import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Stack } from 'expo-router'
import AuthScreen from '../src/screens/AuthScreen'
import { loadSession } from '../src/lib/session'

export default function RootLayout() {
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    ;(async () => {
      const session = await loadSession()
      setAuthed(!!session)
      setLoading(false)
    })()
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!authed) {
    return <AuthScreen onAuthed={() => setAuthed(true)} />
  }

  return (
    <Stack>
      {/* Tabs principales (Home / Explore) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Tickets */}
      <Stack.Screen name="tickets" options={{ title: 'Tickets' }} />
      <Stack.Screen name="ticket-new" options={{ title: 'Nuevo ticket' }} />
      <Stack.Screen name="ticket/[id]" options={{ title: 'Detalle de ticket' }} />
      <Stack.Screen name="ticket/edit/[id]" options={{ title: 'Editar ticket' }} />

      {/* Inventario */}
      {/* app/inventory/index.tsx → ruta /inventory */}
      <Stack.Screen name="inventory" options={{ title: 'Inventario' }} />
      <Stack.Screen name="inventory/new" options={{ title: 'Nuevo equipo' }} />
      <Stack.Screen name="inventory/[id]" options={{ title: 'Detalle de equipo' }} />
      <Stack.Screen
        name="inventory/categories"
        options={{ title: 'Categorías de inventario' }}
      />
      <Stack.Screen
        name="inventory/locations"
        options={{ title: 'Ubicaciones de inventario' }}
      />
      <Stack.Screen
        name="inventory/reports"
        options={{ title: 'Reportes de inventario' }}
      />
    </Stack>
  )
}
