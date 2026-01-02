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

  // En DB se llaman title / description / resolution
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [resolution, setResolution] = useState('')

  // Autogenerado (pero editable)
  useEffect(() => {
    const p = problemEs.trim()
    const s = solutionEs.trim()

    setTitle(p ? `Reporte: ${p.slice(0, 60)}` : '')
    setDescription(p ? `Solicitud del usuario.\n\nDetalles:\n${p}\n` : '')
    setResolution(s ? `Resolución:\n${s}` : '')
  }, [problemEs, solutionEs])

  async function save() {
    if (!customerName.trim() || !sid.trim() || !floor.trim() || !problemEs.trim()) {
      return Alert.alert('Faltan datos', 'Nombre, SID, Piso y Problema son obligatorios.')
    }

    setSaving(true)
    try {
      const session = await loadSession()
      if (!session?.id) throw new Error('No hay sesión. Cierra sesión y vuelve a iniciar.')

      const payload = {
        created_by: session.id,                        // FK a public.users.id
        customer_name: customerName.trim(),
        sid: sid.trim(),
        floor: floor.trim(),
        location_optional: locationOptional.trim() || null,
        problem_es: problemEs.trim(),
        solution_es: solutionEs.trim() || null,

        // columnas nuevas en tu tabla:
        title: title.trim() || null,
        description: description.trim() || null,
        resolution: resolution.trim() || null,

        status: solutionEs.trim() ? 'resolved' : 'open',
      }

      console.log('INSERT payload:', payload)

      const { data, error } = await supabase
        .from('tickets')
        .insert(payload)
        .select('id')
        .single()

      if (error) {
        console.log('INSERT ticket error:', error)
        throw error
      }

      console.log('INSERT OK, id:', data.id)
      // Ir al detalle del ticket recién creado
      router.replace(`/ticket/${data.id}`)
    } catch (e: any) {
      console.log('INSERT CATCH:', e)
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

      <Text style={{ marginTop: 10, fontWeight: '800' }}>
        Resumen del ticket (auto-generado, puedes editarlo)
      </Text>

      <Text style={{ fontWeight: '800' }}>Título</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <Text style={{ fontWeight: '800' }}>Descripción</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        multiline
        style={{ borderWidth: 1, padding: 10, borderRadius: 8, minHeight: 110 }}
      />

      <Text style={{ fontWeight: '800' }}>Resolución</Text>
      <TextInput
        value={resolution}
        onChangeText={setResolution}
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
