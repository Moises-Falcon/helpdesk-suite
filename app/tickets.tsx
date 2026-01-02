// app/tickets.tsx
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { View, Text, Pressable, FlatList, ActivityIndicator, TextInput } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { supabase } from '../src/lib/supabase'

type TicketRow = {
  id: string
  created_at: string
  customer_name: string
  sid: string
  floor: string
  status: 'open' | 'resolved'
  title: string | null
}

export default function TicketsScreen() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<TicketRow[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all')

  async function loadTickets() {
    setLoading(true)
    const { data, error } = await supabase
      .from('tickets')
      .select('id, created_at, customer_name, sid, floor, status, title')
      .order('created_at', { ascending: false })

    if (error) {
      console.log('LOAD tickets error:', error)
      setItems([])
    } else {
      setItems((data ?? []) as TicketRow[])
    }
    setLoading(false)
  }

  useFocusEffect(
    useCallback(() => {
      loadTickets()
    }, [])
  )

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    return items.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (!term) return true

      const haystack = [
        t.customer_name,
        t.sid,
        t.floor,
        t.title ?? '',
        t.status,
        new Date(t.created_at).toLocaleString(),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(term)
    })
  }, [items, search, statusFilter])

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: '800' }}>🎫 Tickets</Text>

        <Pressable
          onPress={() => router.push('/ticket-new')}
          style={{ paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderRadius: 10 }}
        >
          <Text>+ Nuevo</Text>
        </Pressable>
      </View>

      {/* Buscador */}
      <TextInput
        placeholder="Buscar por nombre, SID, piso, título…"
        value={search}
        onChangeText={setSearch}
        style={{ borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 }}
      />

      {/* Filtros estado */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['all', 'open', 'resolved'] as const).map((value) => (
          <Pressable
            key={value}
            onPress={() => setStatusFilter(value)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderWidth: 1,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: statusFilter === value ? '#ddd' : 'transparent',
            }}
          >
            <Text>
              {value === 'all' ? 'Todos' : value === 'open' ? 'Abiertos' : 'Resueltos'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Lista */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text>Cargando...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(t) => t.id}
          ListEmptyComponent={<Text>No hay tickets.</Text>}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/ticket/${item.id}`)}
              style={{ borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 }}
            >
              <Text style={{ fontWeight: '800' }}>{item.title ?? '(sin título)'}</Text>

              <Text style={{ opacity: 0.6, fontSize: 12 }}>
                {new Date(item.created_at).toLocaleString()}
              </Text>

              <Text style={{ opacity: 0.75, marginTop: 2 }}>
                {item.customer_name} • SID {item.sid} • Piso {item.floor}
              </Text>

              <Text style={{ marginTop: 6 }}>
                Estado:{' '}
                <Text
                  style={{
                    fontWeight: '900',
                    color: item.status === 'open' ? 'green' : 'red',
                  }}
                >
                  {item.status === 'open' ? 'Abierto' : 'Resuelto'}
                </Text>
              </Text>
            </Pressable>
          )}
        />
      )}

      {/* Home */}
      <Pressable
        onPress={() => router.replace('/(tabs)')}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
      >
        <Text>Ir a Home</Text>
      </Pressable>
    </View>
  )
}
