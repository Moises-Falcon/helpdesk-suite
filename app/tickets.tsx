// app/tickets.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../src/lib/supabase'

type TicketRow = {
  id: string
  created_at: string
  customer_name: string
  sid: string
  floor: string
  status: 'open' | 'resolved'
  short_en: string | null
}

export default function TicketsScreen() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<TicketRow[]>([])

  async function loadTickets() {
    setLoading(true)
    const { data, error } = await supabase
      .from('tickets')
      .select('id, created_at, customer_name, sid, floor, status, short_en')
      .order('created_at', { ascending: false })

    if (error) {
      console.log('LOAD tickets error:', error)
      setItems([])
    } else {
      setItems((data ?? []) as TicketRow[])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTickets()
  }, [])

  function goHome() {
    router.replace('/(tabs)')
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>🎫 Tickets</Text>

        <Pressable
          onPress={() => router.push('/ticket-new')}
          style={{ paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderRadius: 10 }}
        >
          <Text>+ Nuevo</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={loadTickets}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
      >
        <Text>Recargar</Text>
      </Pressable>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 8 }}>Cargando...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(t) => t.id}
          ListEmptyComponent={
            <Text style={{ opacity: 0.7, marginTop: 10 }}>
              No hay tickets aún. Crea el primero con “+ Nuevo”.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/ticket/${item.id}`)}
              style={{ borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 }}
            >
              <Text style={{ fontWeight: '700' }}>{item.short_en ?? '(sin título)'}</Text>
              <Text style={{ opacity: 0.75 }}>
                {item.customer_name} • SID {item.sid} • Piso {item.floor}
              </Text>
              <Text style={{ marginTop: 6 }}>
                Estado: <Text style={{ fontWeight: '700' }}>{item.status}</Text>
              </Text>
            </Pressable>
          )}
        />
      )}

      <Pressable
        onPress={goHome}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
      >
        <Text>Ir a Home</Text>
      </Pressable>
    </View>
  )
}
