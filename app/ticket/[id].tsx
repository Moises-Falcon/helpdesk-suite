import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { supabase } from '../../src/lib/supabase'

export default function TicketDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [t, setT] = useState<any>(null)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from('tickets').select('*').eq('id', id).single()
    if (error) {
      Alert.alert('Error', error.message)
      setT(null)
    } else {
      setT(data)
    }
    setLoading(false)
  }

  function goBackSafe() {
    if (router.canGoBack()) router.back()
    else router.replace('/tickets') // fallback si abriste directo la URL
  }

  useEffect(() => {
    load()
  }, [id])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!t) {
    return (
      <View style={{ flex: 1, padding: 16, gap: 12 }}>
        <Text>No se encontró el ticket.</Text>
        <Pressable
          onPress={goBackSafe}
          style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
        >
          <Text>Volver</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>🎫 Ticket</Text>
      <Text style={{ opacity: 0.7 }}>ID: {t.id}</Text>

      <Text style={{ fontWeight: '700' }}>Título (EN)</Text>
      <Text>{t.short_en ?? '-'}</Text>

      <Text style={{ fontWeight: '700' }}>Solicitante</Text>
      <Text>
        {t.customer_name} • SID {t.sid} • Piso {t.floor}
      </Text>
      <Text>Ubicación: {t.location_optional ?? '-'}</Text>

      <Text style={{ fontWeight: '700' }}>Problema (ES)</Text>
      <Text>{t.problem_es}</Text>

      <Text style={{ fontWeight: '700' }}>Solución (ES)</Text>
      <Text>{t.solution_es ?? '-'}</Text>

      <Text style={{ fontWeight: '700' }}>Descripción larga (EN)</Text>
      <Text>{t.long_en ?? '-'}</Text>

      <Text style={{ fontWeight: '700' }}>Resolución (EN)</Text>
      <Text>{t.resolution_en ?? '-'}</Text>

      <Text>
        Estado: <Text style={{ fontWeight: '700' }}>{t.status}</Text>
      </Text>

      <Pressable
        onPress={load}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
      >
        <Text>Recargar</Text>
      </Pressable>

      <Pressable
        onPress={goBackSafe}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
      >
        <Text>Volver</Text>
      </Pressable>
    </ScrollView>
  )
}
