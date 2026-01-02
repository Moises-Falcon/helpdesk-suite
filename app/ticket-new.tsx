// app/ticket-new.tsx
import React, { useEffect, useState } from 'react'
import { Text, TextInput, Pressable, Alert, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../src/lib/supabase'
import { loadSession } from '../src/lib/session'

export default function TicketNew() {
  const [saving, setSaving] = useState(false)

  const [customerName, setCustomerName] = useState('')
  const [sid, setSid] = useState('')
  const [floor, setFloor] = useState('')
  const [locationOptional, setLocationOptional] = useState('')
  const [problemEs, setProblemEs] = useState('')
  const [solutionEs, setSolutionEs] = useState('')

  // Generamos título/descripcion/resolución internamente (no se muestran aparte)
  function buildSummary() {
    const p = problemEs.trim()
    const s = solutionEs.trim()

    const title = p ? `Reporte: ${p.slice(0, 60)}` : null
    const description = p ? `Solicitud del usuario.\n\nDetalles:\n${p}\n` : null
    const resolution = s ? `Resolución:\n${s}` : null

    return { title, description, resolution }
  }

  async function save() {
    if (!customerName.trim() || !sid.trim() || !floor.trim() || !problemEs.trim()) {
      return Alert.alert('Faltan datos', 'Nombre, SID, Piso y Problema son obligatorios.')
    }

    setSaving(true)
    try {
      const session = await loadSession()
      if (!session?.id) throw new Error('No hay sesión. Cierra sesión y vuelve a iniciar.')

      const { title, description, resolution } = buildSummary()

      const payload = {
        created_by: session.id,
        customer_name: customerName.trim(),
        sid: sid.trim(),
        floor: floor.trim(),
        location_optional: locationOptional.trim() || null,
        problem_es: problemEs.trim(),
        solution_es: solutionEs.trim() || null,
        title,
        description,
        resolution,
        status: solutionEs.trim() ? 'resolved' : 'open',
      }

      const { data, error } = await supabase.from('tickets').insert(payload).select('id').single()
      if (error) throw error

      router.replace(`/ticket/${data.id}`)
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: '800' }}>➕ Nuevo Ticket</Text>

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

      <Text style={{ fontWeight: '800' }}>Solución (opcional)</Text>
      <TextInput
        value={solutionEs}
        onChangeText={setSolutionEs}
        multiline
        style={{ borderWidth: 1, padding: 10, borderRadius: 8, minHeight: 90 }}
      />

      <Pressable
        onPress={save}
        disabled={saving}
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 10,
          alignItems: 'center',
          opacity: saving ? 0.6 : 1,
        }}
      >
        <Text>{saving ? 'Guardando...' : 'Guardar ticket'}</Text>
      </Pressable>

      <Pressable
        onPress={() => router.replace('/tickets')}
        style={{ padding: 14, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
      >
        <Text>Cancelar</Text>
      </Pressable>
    </ScrollView>
  )
}
