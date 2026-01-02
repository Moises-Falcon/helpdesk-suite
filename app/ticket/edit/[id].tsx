// app/ticket/edit/[id].tsx
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, View, Pressable } from 'react-native'
import { supabase } from '../../../src/lib/supabase'

type Ticket = {
  id: string
  customer_name: string
  sid: string
  floor: string
  location_optional: string | null
  problem_es: string
  solution_es: string | null
  status: 'open' | 'resolved'
}

export default function TicketEdit() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [customerName, setCustomerName] = useState('')
  const [sid, setSid] = useState('')
  const [floor, setFloor] = useState('')
  const [locationOptional, setLocationOptional] = useState('')
  const [problemEs, setProblemEs] = useState('')
  const [solutionEs, setSolutionEs] = useState('')
  const [status, setStatus] = useState<'open' | 'resolved'>('open')

  useEffect(() => {
    async function load() {
      if (!id || typeof id !== 'string') return

      setLoading(true)
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        console.log('LOAD ticket edit error:', error)
        Alert.alert('Error', 'No se pudo cargar el ticket.')
        router.replace('/tickets')
        return
      }

      const t = data as Ticket
      setCustomerName(t.customer_name)
      setSid(t.sid)
      setFloor(t.floor)
      setLocationOptional(t.location_optional ?? '')
      setProblemEs(t.problem_es)
      setSolutionEs(t.solution_es ?? '')
      setStatus(t.status)

      setLoading(false)
    }

    load()
  }, [id])

  function buildSummary() {
    const p = problemEs.trim()
    const s = solutionEs.trim()

    const title = p ? `Reporte: ${p.slice(0, 60)}` : null
    const description = p ? `Solicitud del usuario.\n\nDetalles:\n${p}\n` : null
    const resolution = s ? `Resolución:\n${s}` : null

    return { title, description, resolution }
  }

  async function save() {
    if (!id || typeof id !== 'string') return

    if (!customerName.trim() || !sid.trim() || !floor.trim() || !problemEs.trim()) {
      return Alert.alert('Faltan datos', 'Nombre, SID, Piso y Problema son obligatorios.')
    }

    setSaving(true)
    try {
      const { title, description, resolution } = buildSummary()

      const payload = {
        customer_name: customerName.trim(),
        sid: sid.trim(),
        floor: floor.trim(),
        location_optional: locationOptional.trim() || null,
        problem_es: problemEs.trim(),
        solution_es: solutionEs.trim() || null,
        title,
        description,
        resolution,
        status,
      }

      const { error } = await supabase.from('tickets').update(payload).eq('id', id)
      if (error) throw error

      router.replace(`/ticket/${id}`)
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? String(e))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: '800' }}>✏️ Editar Ticket</Text>

      <Text style={{ fontWeight: '800' }}>Nombre</Text>
      <TextInput
        value={customerName}
        onChangeText={setCustomerName}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <Text style={{ fontWeight: '800' }}>SID</Text>
      <TextInput
        value={sid}
        onChangeText={setSid}
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <Text style={{ fontWeight: '800' }}>Piso</Text>
      <TextInput
        value={floor}
        onChangeText={setFloor}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <Text style={{ fontWeight: '800' }}>Ubicación (opcional)</Text>
      <TextInput
        value={locationOptional}
        onChangeText={setLocationOptional}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <Text style={{ fontWeight: '800' }}>Problema</Text>
      <TextInput
        value={problemEs}
        onChangeText={setProblemEs}
        multiline
        style={{ borderWidth: 1, padding: 10, borderRadius: 8, minHeight: 90 }}
      />

      <Text style={{ fontWeight: '800' }}>Solución (texto)</Text>
      <TextInput
        value={solutionEs}
        onChangeText={setSolutionEs}
        multiline
        style={{ borderWidth: 1, padding: 10, borderRadius: 8, minHeight: 90 }}
      />

      {/* Estado */}
      <Text style={{ fontWeight: '800', marginTop: 10 }}>Estado</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['open', 'resolved'] as const).map((value) => (
          <Pressable
            key={value}
            onPress={() => setStatus(value)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderWidth: 1,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: status === value ? '#ddd' : 'transparent',
            }}
          >
            <Text>{value === 'open' ? 'open' : 'resolved'}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={save}
        disabled={saving}
        style={{
          marginTop: 10,
          padding: 14,
          borderWidth: 1,
          borderRadius: 10,
          alignItems: 'center',
          opacity: saving ? 0.6 : 1,
        }}
      >
        <Text>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
      </Pressable>

      <Pressable
        onPress={() => router.replace(`/ticket/${id}`)}
        style={{ padding: 14, borderWidth: 1, borderRadius: 10, alignItems: 'center', marginTop: 6 }}
      >
        <Text>Cancelar</Text>
      </Pressable>
    </ScrollView>
  )
}
