// app/inventory/locations.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native'
import { supabase } from '../../src/lib/supabase'

type InventoryLocation = {
  id: string
  building: string
  floor: string
  room: string
}

export default function InventoryLocationsScreen() {
  const [loading, setLoading] = useState(true)
  const [locations, setLocations] = useState<InventoryLocation[]>([])

  const [building, setBuilding] = useState('')
  const [floor, setFloor] = useState('')
  const [room, setRoom] = useState('')
  const [saving, setSaving] = useState(false)

  async function loadLocations() {
    setLoading(true)
    const { data, error } = await supabase
      .from('inventory_locations')
      .select('id, building, floor, room')
      .order('building', { ascending: true })

    if (error) {
      console.log('Error cargando ubicaciones:', error)
      setLocations([])
    } else {
      setLocations((data ?? []) as InventoryLocation[])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadLocations()
  }, [])

  async function addLocation() {
    const b = building.trim()
    const f = floor.trim()
    const r = room.trim()

    if (!b || !f || !r) {
      return Alert.alert(
        'Faltan datos',
        'Escribe edificio, piso y sala para registrar una ubicación.',
      )
    }

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('inventory_locations')
        .insert({ building: b, floor: f, room: r })
        .select('id, building, floor, room')
        .single()

      if (error) throw error

      setBuilding('')
      setFloor('')
      setRoom('')
      setLocations((prev) => [...prev, data as InventoryLocation])
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '900' }}>📍 Ubicaciones</Text>
      <Text style={{ opacity: 0.8 }}>
        Define edificios, pisos y salas donde se encuentran los equipos.
      </Text>

      {/* Formulario nueva ubicación */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: '800' }}>Nueva ubicación</Text>
        <TextInput
          placeholder="Edificio (ej. Torre A)"
          value={building}
          onChangeText={setBuilding}
          style={{ borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 }}
        />
        <TextInput
          placeholder="Piso (ej. 2)"
          value={floor}
          onChangeText={setFloor}
          style={{ borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 }}
        />
        <TextInput
          placeholder="Sala (ej. Helpdesk)"
          value={room}
          onChangeText={setRoom}
          style={{ borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 }}
        />
        <Pressable
          onPress={addLocation}
          disabled={saving}
          style={{
            padding: 12,
            borderWidth: 1,
            borderRadius: 10,
            alignItems: 'center',
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Text>{saving ? 'Guardando…' : 'Agregar ubicación'}</Text>
        </Pressable>
      </View>

      {/* Lista de ubicaciones */}
      <View style={{ flex: 1, marginTop: 12 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 6 }}>Cargando ubicaciones…</Text>
          </View>
        ) : (
          <FlatList
            data={locations}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text>No hay ubicaciones registradas.</Text>}
            renderItem={({ item }) => (
              <View
                style={{
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontWeight: '800' }}>
                  {item.building} • Piso {item.floor}
                </Text>
                <Text style={{ opacity: 0.8 }}>Sala: {item.room}</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  )
}
