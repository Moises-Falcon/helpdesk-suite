// app/ticket/[id].tsx
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { supabase } from '../../src/lib/supabase'

type Ticket = {
  id: string
  created_at: string
  customer_name: string
  sid: string
  floor: string
  location_optional: string | null
  problem_es: string
  solution_es: string | null
  status: 'open' | 'resolved'
  title: string | null
  description: string | null
  resolution: string | null
}

export default function TicketDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [t, setT] = useState<Ticket | null>(null)

  async function load() {
    if (!id || typeof id !== 'string') return
    // si id = 'tickets' u otro string raro, mandamos a lista
    if (id === 'tickets' || id === 'edit') {
      router.replace('/tickets')
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.log('LOAD ticket error:', error)
      Alert.alert('Error', 'No se pudo cargar el ticket.')
      setT(null)
    } else {
      setT(data as Ticket)
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
      <Text style={{ fontSize: 22, fontWeight: '800' }}>🎫 Detalle del Ticket</Text>
      <Text style={{ opacity: 0.7 }}>ID: {t.id}</Text>
      <Text style={{ opacity: 0.7 }}>
        Creado: {new Date(t.created_at).toLocaleString()}
      </Text>

      {/* Pequeña línea separadora */}
      <View style={{ height: 1, backgroundColor: '#ddd', marginVertical: 10 }} />

      {/* Título */}
      <Text style={{ fontWeight: '800' }}>Título</Text>
      <Text>{t.title ?? '-'}</Text>

      {/* Solicitante */}
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: '800' }}>Solicitante</Text>
        <Text>
          {t.customer_name} • SID {t.sid} • Piso {t.floor}
        </Text>
        <Text>Ubicación: {t.location_optional ?? '-'}</Text>
      </View>

      {/* Problema */}
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: '800' }}>Problema</Text>
        <Text>{t.problem_es}</Text>
      </View>

      {/* Solución texto */}
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: '800' }}>Solución (texto)</Text>
        <Text>{t.solution_es ?? '-'}</Text>
      </View>

      {/* Descripción / Resumen largo */}
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: '800' }}>Descripción</Text>
        <Text>{t.description ?? '-'}</Text>
      </View>

      {/* Resolución formateada */}
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: '800' }}>Resolución</Text>
        <Text>{t.resolution ?? '-'}</Text>
      </View>

      {/* Estado */}
      <View style={{ marginTop: 10 }}>
        <Text>
          Estado:{' '}
          <Text style={{ fontWeight: '800' }}>
            {t.status === 'open' ? 'open' : 'resolved'}
          </Text>
        </Text>
      </View>

      {/* Botones */}
      <View style={{ height: 1, backgroundColor: '#ddd', marginVertical: 10 }} />

      <Pressable
        onPress={() => router.push(`/ticket/edit/${t.id}`)}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center', marginBottom: 6 }}
      >
        <Text>Editar</Text>
      </Pressable>

      <Pressable
        onPress={load}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center', marginBottom: 6 }}
      >
        <Text>Recargar</Text>
      </Pressable>

      <Pressable
        onPress={() => router.replace('/tickets')}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
      >
        <Text>Volver a la lista</Text>
      </Pressable>
    </ScrollView>
  )
}
