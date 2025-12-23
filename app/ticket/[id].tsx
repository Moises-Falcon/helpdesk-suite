// app/ticket/[id].tsx
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { supabase } from '../../src/lib/supabase'

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
}

export default function TicketDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [t, setT] = useState<any>(null)

  async function load() {
    if (!id || typeof id !== 'string') return

    // ✅ evita el bug si llega "tickets"
    if (!isUuid(id)) {
      router.replace('/tickets')
      return
    }

    setLoading(true)
    const { data, error } = await supabase.from('tickets').select('*').eq('id', id).single()

    if (error) {
      console.log('LOAD ticket error:', error)
      setT(null)
    } else {
      setT(data)
    }
    setLoading(false)
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
          onPress={() => router.replace('/tickets')}
          style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
        >
          <Text>Ir a lista</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: '800' }}>🎟️ Ticket</Text>
      <Text style={{ opacity: 0.7 }}>ID: {t.id}</Text>

      <Text style={{ fontWeight: '800' }}>Título</Text>
      <Text>{t.short_en ?? '-'}</Text>

      <Text style={{ fontWeight: '800' }}>Solicitante</Text>
      <Text>
        {t.customer_name} • SID {t.sid} • Piso {t.floor}
      </Text>
      <Text>Ubicación: {t.location_optional ?? '-'}</Text>

      <Text style={{ fontWeight: '800' }}>Problema</Text>
      <Text>{t.problem_es}</Text>

      <Text style={{ fontWeight: '800' }}>Solución</Text>
      <Text>{t.solution_es ?? '-'}</Text>

      <Text>
        Estado: <Text style={{ fontWeight: '800' }}>{t.status}</Text>
      </Text>

      <Pressable
        onPress={() => router.push(`/ticket/edit/${t.id}`)}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
      >
        <Text>Editar</Text>
      </Pressable>

      <Pressable
        onPress={load}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
      >
        <Text>Recargar</Text>
      </Pressable>

      <Pressable
        onPress={() => router.replace('/tickets')}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
      >
        <Text>Volver a lista</Text>
      </Pressable>

      <Pressable
        onPress={() => router.replace('/(tabs)')}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
      >
        <Text>Ir a Home</Text>
      </Pressable>
    </ScrollView>
  )
}
