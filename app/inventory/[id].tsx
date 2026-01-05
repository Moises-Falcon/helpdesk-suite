// app/inventory/[id].tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { supabase } from '../../src/lib/supabase'

type InventoryItem = {
  id: string
  name: string
  quantity: number
  status: 'new' | 'used' | 'defective'
  comments: string | null
  photo_url: string | null
  location_id: string | null
  created_at: string
}

type InventoryLocation = {
  id: string
  building: string
  floor: string
  room: string
}

type InventoryCategory = {
  id: string
  name: string
}

type InventoryMovement = {
  id: string
  change: number
  movement_type: 'in' | 'out' | 'adjust'
  reason: string | null
  created_at: string
}

export default function InventoryItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [loading, setLoading] = useState(true)

  const [item, setItem] = useState<InventoryItem | null>(null)
  const [location, setLocation] = useState<InventoryLocation | null>(null)
  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [movements, setMovements] = useState<InventoryMovement[]>([])

  useEffect(() => {
    if (!id || typeof id !== 'string') return
    loadAll(id)
  }, [id])

  async function loadAll(itemId: string) {
    try {
      setLoading(true)

      // 1) Item principal
      const { data: itemData, error: itemError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .single()

      if (itemError || !itemData) {
        console.log('Error cargando item:', itemError)
        Alert.alert('Error', 'No se pudo cargar el equipo.')
        setItem(null)
        setLocation(null)
        setCategories([])
        setMovements([])
        return
      }

      const typedItem = itemData as InventoryItem
      setItem(typedItem)

      // 2) Ubicación (si tiene)
      if (typedItem.location_id) {
        const { data: locData, error: locError } = await supabase
          .from('inventory_locations')
          .select('id, building, floor, room')
          .eq('id', typedItem.location_id)
          .single()

        if (!locError && locData) {
          setLocation(locData as InventoryLocation)
        } else {
          setLocation(null)
        }
      } else {
        setLocation(null)
      }

      // 3) Categorías
      const { data: linkRows, error: linkError } = await supabase
        .from('inventory_item_categories')
        .select('category_id')
        .eq('item_id', itemId)

      if (!linkError && linkRows && linkRows.length > 0) {
        const categoryIds = linkRows.map((r: any) => r.category_id)
        const { data: catData, error: catError } = await supabase
          .from('inventory_categories')
          .select('id, name')
          .in('id', categoryIds)

        if (!catError && catData) {
          setCategories(catData as InventoryCategory[])
        } else {
          setCategories([])
        }
      } else {
        setCategories([])
      }

      // 4) Movimientos recientes
      const { data: movData, error: movError } = await supabase
        .from('inventory_movements')
        .select('id, change, movement_type, reason, created_at')
        .eq('item_id', itemId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!movError && movData) {
        setMovements(movData as InventoryMovement[])
      } else {
        setMovements([])
      }
    } catch (e) {
      console.log('Error general cargando detalle de inventario:', e)
      Alert.alert('Error', 'Ocurrió un error al cargar el detalle.')
    } finally {
      setLoading(false)
    }
  }

  function formatStatusLabel(status: InventoryItem['status']) {
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

  function formatMovementType(t: InventoryMovement['movement_type']) {
    switch (t) {
      case 'in':
        return 'Entrada'
      case 'out':
        return 'Salida'
      case 'adjust':
        return 'Ajuste'
      default:
        return t
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!item) {
    return (
      <View style={{ flex: 1, padding: 16, gap: 12 }}>
        <Text>No se encontró el equipo.</Text>
        <Pressable
          onPress={() => router.replace('/inventory')}
          style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
        >
          <Text>Volver a inventario</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '900' }}>📦 Detalle de equipo</Text>
      <Text style={{ opacity: 0.7 }}>ID: {item.id}</Text>
      <Text style={{ opacity: 0.7 }}>
        Registrado: {new Date(item.created_at).toLocaleString()}
      </Text>

      {/* Foto */}
      <View
        style={{
          marginTop: 8,
          borderWidth: 1,
          borderRadius: 12,
          padding: 8,
          alignItems: 'center',
        }}
      >
        {item.photo_url ? (
          <Image
            source={{ uri: item.photo_url }}
            style={{ width: 200, height: 200, borderRadius: 12 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: 200,
              height: 200,
              borderRadius: 12,
              borderWidth: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ opacity: 0.6 }}>Sin foto</Text>
          </View>
        )}
      </View>

      {/* Datos principales */}
      <View style={{ marginTop: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '900' }}>{item.name}</Text>

        <Text style={{ marginTop: 4 }}>
          Cantidad:{' '}
          <Text style={{ fontWeight: '800' }}>
            {item.quantity}
          </Text>
        </Text>

        <Text style={{ marginTop: 4 }}>
          Estado:{' '}
          <Text
            style={{
              fontWeight: '800',
              color:
                item.status === 'new'
                  ? 'green'
                  : item.status === 'used'
                  ? 'orange'
                  : 'red',
            }}
          >
            {formatStatusLabel(item.status)}
          </Text>
        </Text>
      </View>

      {/* Comentarios */}
      <View style={{ marginTop: 8 }}>
        <Text style={{ fontWeight: '800' }}>Comentarios</Text>
        <Text style={{ marginTop: 2 }}>{item.comments ?? 'Sin comentarios.'}</Text>
      </View>

      {/* Ubicación */}
      <View style={{ marginTop: 8 }}>
        <Text style={{ fontWeight: '800' }}>Ubicación</Text>
        {location ? (
          <Text style={{ marginTop: 2 }}>
            {location.building} • Piso {location.floor} • Sala {location.room}
          </Text>
        ) : (
          <Text style={{ marginTop: 2, opacity: 0.7 }}>Sin ubicación asignada.</Text>
        )}
      </View>

      {/* Categorías */}
      <View style={{ marginTop: 8 }}>
        <Text style={{ fontWeight: '800' }}>Categorías</Text>
        {categories.length === 0 ? (
          <Text style={{ marginTop: 2, opacity: 0.7 }}>Sin categorías.</Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {categories.map((cat) => (
              <View
                key={cat.id}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  borderWidth: 1,
                }}
              >
                <Text>{cat.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Historial de movimientos */}
      <View style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: '800', fontSize: 16 }}>Historial de movimientos</Text>
        {movements.length === 0 ? (
          <Text style={{ marginTop: 4, opacity: 0.7 }}>
            Aún no hay movimientos registrados para este equipo.
          </Text>
        ) : (
          <View style={{ marginTop: 4, gap: 8 }}>
            {movements.map((m) => (
              <View
                key={m.id}
                style={{
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 8,
                }}
              >
                <Text style={{ fontWeight: '800' }}>
                  {formatMovementType(m.movement_type)}{' '}
                  <Text
                    style={{
                      fontWeight: '900',
                      color: m.change > 0 ? 'green' : m.change < 0 ? 'red' : 'black',
                    }}
                  >
                    {m.change > 0 ? `+${m.change}` : m.change}
                  </Text>
                </Text>
                {m.reason ? (
                  <Text style={{ marginTop: 2 }}>Motivo: {m.reason}</Text>
                ) : null}
                <Text style={{ marginTop: 2, fontSize: 12, opacity: 0.7 }}>
                  {new Date(m.created_at).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Botones (por ahora solo básicos, sin navegación extra) */}
      <View style={{ height: 1, backgroundColor: '#ddd', marginVertical: 12 }} />

      <Pressable
        onPress={() => Alert.alert('Pendiente', 'Registrar movimiento se implementará después.')}
        style={{
          padding: 12,
          borderWidth: 1,
          borderRadius: 10,
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <Text>➕ Registrar movimiento</Text>
      </Pressable>

      <Pressable
        onPress={() => router.replace('/inventory')}
        style={{
          padding: 12,
          borderWidth: 1,
          borderRadius: 10,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text>Volver a inventario</Text>
      </Pressable>
    </ScrollView>
  )
}
