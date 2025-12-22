import React from 'react'
import { View, Text, Pressable, Alert, Platform } from 'react-native'
import { clearSession, loadSession } from '../../src/lib/session'
import { router } from 'expo-router'

export default function HomeTab() {
  const debugSession = async () => {
    try {
      console.log('DEBUG SESSION pressed')
      const s = await loadSession()
      console.log('SESSION:', s)

      const msg = s ? JSON.stringify(s, null, 2) : 'No hay sesión'
      // Alert en web a veces no aparece; fallback:
      if (Platform.OS === 'web') {
        window.alert(msg)
      } else {
        Alert.alert('Sesión', msg)
      }
    } catch (e: any) {
      console.log('DEBUG SESSION error:', e)
      if (Platform.OS === 'web') window.alert(e?.message ?? String(e))
      else Alert.alert('Error', e?.message ?? String(e))
    }
  }

  const logout = async () => {
    try {
      console.log('LOGOUT pressed')
      await clearSession()
      console.log('SESSION cleared')
      router.replace('/') // vuelve al RootLayout -> login
    } catch (e: any) {
      console.log('LOGOUT error:', e)
      if (Platform.OS === 'web') window.alert(e?.message ?? String(e))
      else Alert.alert('Error', e?.message ?? String(e))
    }
  }

  const goTickets = () => {
    console.log('GO TICKETS pressed')
    router.push('/tickets')
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>✅ Logueado</Text>
      <Text>Si estás viendo esto, el login funcionó y ya estás dentro.</Text>

      <Pressable
        onPress={debugSession}
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 10,
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Text>Ver sesión</Text>
      </Pressable>

      <Pressable
        onPress={goTickets}
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 10,
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Text>Ir a Tickets</Text>
      </Pressable>

      <Pressable
        onPress={logout}
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 10,
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Text>Cerrar sesión</Text>
      </Pressable>
    </View>
  )
}
