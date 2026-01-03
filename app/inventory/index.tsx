// app/inventory/index.tsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
  Pressable,
} from 'react-native'
import { supabase } from '../../src/lib/supabase'
import { router } from 'expo-router'

type InventoryItem = {
  id: string
  name: string
  quantity: number
  status: 'new' | 'used' | 'defective' | string
  comments: string | null
  photo_url: string | null
  created_at: string
}

export default function InventoryListScreen() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'used' | 'defective'>('all')

  async function loadItems() {
    setLoading(true)
    const { data, error } = await supabase
      .from('inventory_items')
      .select('id, name, quantity, status, comments, photo_url, created_at')
      .order('name', { ascending: true })

    if (error) {
      console.log('Error cargando inventario:', error)
      setItems([])
    } else {
      setItems((data ?? []) as InventoryItem[])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadItems()
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return items.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      if (!term) return true

      const haystack = [
        item.name,
        item.comments ?? '',
        item.status,
        String(item.quantity),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(term)
    })
  }, [items, search, statusFilter])

  function renderStatusLabel(status: string) {
    switch (status) {
      case 'new':
        return 'Nuevo'
      case 'used':
        return 'Usado'
      case 'defective':
        return 'Defectuoso'
      default:
        return status
    }
  }

  function statusColor(status: string) {
    switch (status) {
      case 'new':
        return 'green'
      case 'used':
        return 'orange'
      case 'defective':
        return 'red'
      default:
        return 'black'
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 10 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: '900' }}>📋 Inventario</Text>

        <Pressable
          onPress={() => router.push('/inventory/new')}
          style={{ paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderRadius: 10 }}
        >
          <Text>➕ Nuevo</Text>
        </Pressable>
      </View>

      {/* Buscador */}
      <TextInput
        placeholder="Buscar por nombre o comentario…"
        value={search}
        onChangeText={setSearch}
        style={{ borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 }}
      />

      {/* Filtro por estado */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['all', 'new', 'used', 'defective'] as const).map((value) => (
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
              {value === 'all'
                ? 'Todos'
                : value === 'new'
                ? 'Nuevos'
                : value === 'used'
                ? 'Usados'
                : 'Defectuosos'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Lista */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 6 }}>Cargando inventario…</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text>No hay equipos en el inventario.</Text>}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/inventory/${item.id}`)}
              style={{
                flexDirection: 'row',
                borderWidth: 1,
                borderRadius: 12,
                padding: 10,
                marginBottom: 10,
                gap: 10,
              }}
            >
              {/* Foto */}
              {item.photo_url ? (
                <Image
                  source={{ uri: item.photo_url }}
                  style={{ width: 64, height: 64, borderRadius: 8 }}
                />
              ) : (
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    borderWidth: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, textAlign: 'center' }}>Sin foto</Text>
                </View>
              )}

              {/* Info */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '900' }}>{item.name}</Text>
                <Text style={{ opacity: 0.8 }}>Cantidad: {item.quantity}</Text>

                {item.comments ? (
                  <Text numberOfLines={2} style={{ fontSize: 12, opacity: 0.7 }}>
                    {item.comments}
                  </Text>
                ) : null}

                <Text style={{ marginTop: 4, fontSize: 12 }}>
                  Estado:{' '}
                  <Text
                    style={{
                      fontWeight: '900',
                      color: statusColor(item.status),
                    }}
                  >
                    {renderStatusLabel(item.status)}
                  </Text>
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  )
}
