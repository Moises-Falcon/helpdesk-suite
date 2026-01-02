// app/ticket-new.tsx
import React, { useState } from 'react'
import { Text, TextInput, Pressable, Alert, ScrollView, View } from 'react-native'
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
  const [status, setStatus] = useState<'open' | 'resolved'>('open')

  function buildSummary() {
    const p = problemEs.trim()
    const s = solutionEs.trim()

    const title = p ? `Reporte: ${p.slice(0, 60)}` : null
    const description = p ? `Solicitud del usuario.\n\nDetalles:\n${p}\n` : null
    const resolution = s ? `Resolución:\n${s}` : null

    return { title, description, resolution }
  }

  async function save() {
    if (!customerName || !sid || !floor || !problemEs)
      return Alert.alert('Faltan datos', 'Completa nombre, SID, piso y problema.')

    setSaving(true)

    try {
      const session = await loadSession()
      if (!session?.id) throw new Error('No hay sesión activa')

      const { title, description, resolution } = buildSummary()

      const { data, error } = await supabase
        .from('tickets')
        .insert({
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
          status,
        })
        .select('id')
        .single()

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

      <Text>Nombre</Text>
      <TextInput style={{ borderWidth: 1, padding: 10 }} value={customerName} onChangeText={setCustomerName} />

      <Text>SID</Text>
      <TextInput style={{ borderWidth: 1, padding: 10 }} value={sid} onChangeText={setSid} />

      <Text>Piso</Text>
      <TextInput style={{ borderWidth: 1, padding: 10 }} value={floor} onChangeText={setFloor} />

      <Text>Ubicación (opcional)</Text>
      <TextInput style={{ borderWidth: 1, padding: 10 }} value={locationOptional} onChangeText={setLocationOptional} />

      <Text>Problema</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, minHeight: 80 }}
        multiline
        value={problemEs}
        onChangeText={setProblemEs}
      />

      <Text>Solución (opcional)</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, minHeight: 80 }}
        multiline
        value={solutionEs}
        onChangeText={setSolutionEs}
      />

      <Text>Estado</Text>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['open', 'resolved'] as const).map((value) => (
          <Pressable
            key={value}
            onPress={() => setStatus(value)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderWidth: 1,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: status === value ? '#ddd' : 'transparent',
            }}
          >
            <Text>{value === 'open' ? 'Abierto' : 'Resuelto'}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={save}
        disabled={saving}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
      >
        <Text>{saving ? 'Guardando…' : 'Guardar ticket'}</Text>
      </Pressable>
    </ScrollView>
  )
}
