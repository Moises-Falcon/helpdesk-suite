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
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  )
}
