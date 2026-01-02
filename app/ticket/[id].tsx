// app/ticket/[id].tsx
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { supabase } from '../../src/lib/supabase'

export default function TicketDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [t, setT] = useState<any>(null)

  async function load() {
    if (!id) return
    setLoading(true)
    const { data, error } = await supabase.from('tickets').select('*').eq('id', id).single()
    if (error) {
      console.log('LOAD ticket error:', error)
      Alert.alert('Error', error.message)
      setT(null)
    } else {
      setT(data)
    }
    setLoading(false)
  }

  function goBackSafe() {
    if (router.canGoBack()) router.back()
    else router.replace('/tickets')
  }

  useEffect(() => {
    // si por error llega "tickets" como id (bug viejo), mandamos a la lista
    if (id === 'tickets' || id === 'edit') {
      router.replace('/tickets')
      return
    }
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
      <Text style={{ fontSize: 22, fontWeight: '700' }}>🎫 Detalle del Ticket</Text>
      <Text style={{ opacity: 0.7 }}>ID: {t.id}</Text>

      <Text style={{ fontWeight: '700' }}>Título</Text>
      <Text>{t.title ?? '-'}</Text>

      <Text style={{ fontWeight: '700' }}>Solicitante</Text>
      <Text>
        {t.customer_name} • SID {t.sid} • Piso {t.floor}
      </Text>
      <Text>Ubicación: {t.location_optional ?? '-'}</Text>

      <Text style={{ fontWeight: '700' }}>Problema</Text>
      <Text>{t.problem_es}</Text>

      <Text style={{ fontWeight: '700' }}>Solución (texto)</Text>
      <Text>{t.solution_es ?? '-'}</Text>

      <Text style={{ fontWeight: '700' }}>Descripción</Text>
      <Text>{t.description ?? '-'}</Text>

      <Text style={{ fontWeight: '700' }}>Resolución</Text>
      <Text>{t.resolution ?? '-'}</Text>

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
        <Text>Volver a la lista</Text>
      </Pressable>
    </ScrollView>
  )
}
