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

  const [shortEn, setShortEn] = useState('')
  const [longEn, setLongEn] = useState('')
  const [resolutionEn, setResolutionEn] = useState('')

  useEffect(() => {
    const title = problemEs.trim()
      ? `User reported: ${problemEs.trim().slice(0, 60)}`
      : ''
    setShortEn(title)

    const long = problemEs.trim()
      ? `Request from user.\n\nDetails (Spanish input):\n${problemEs.trim()}\n`
      : ''
    setLongEn(long)

    const res = solutionEs.trim()
      ? `Resolution:\n${solutionEs.trim()}`
      : ''
    setResolutionEn(res)
  }, [problemEs, solutionEs])

  async function save() {
    if (!customerName.trim() || !sid.trim() || !floor.trim() || !problemEs.trim()) {
      return Alert.alert('Faltan datos', 'Nombre, SID, Piso y Problema son obligatorios.')
    }

    setSaving(true)
    try {
      const session = await loadSession()
      if (!session?.id) {
        throw new Error('No hay sesión. Cierra sesión y vuelve a iniciar.')
      }

      const payload = {
        created_by: session.id, // <- ahora apunta a public.users (tras el fix SQL)
        customer_name: customerName.trim(),
        sid: sid.trim(),
        floor: floor.trim(),
        location_optional: locationOptional.trim() || null,
        problem_es: problemEs.trim(),
        solution_es: solutionEs.trim() || null,
        short_en: shortEn.trim() || null,
        long_en: longEn.trim() || null,
        resolution_en: resolutionEn.trim() || null,
        status: solutionEs.trim() ? 'resolved' : 'open',
      }

      const { data, error } = await supabase
        .from('tickets')
        .insert(payload)
        .select('id')
        .single()

      if (error) throw error
      router.push(`/ticket/${data.id}`)
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>➕ Nuevo Ticket</Text>

      <Text>Nombre</Text>
      <TextInput value={customerName} onChangeText={setCustomerName}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }} />

      <Text>SID</Text>
      <TextInput value={sid} onChangeText={setSid}
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }} />

      <Text>Piso</Text>
      <TextInput value={floor} onChangeText={setFloor}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }} />

      <Text>Ubicación (opcional)</Text>
      <TextInput value={locationOptional} onChangeText={setLocationOptional}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }} />

      <Text>Problema (ES)</Text>
      <TextInput value={problemEs} onChangeText={setProblemEs}
        multiline
        style={{ borderWidth: 1, padding: 10, borderRadius: 8, minHeight: 90 }} />

      <Text>Solución (ES) (opcional)</Text>
      <TextInput value={solutionEs} onChangeText={setSolutionEs}
        multiline
        style={{ borderWidth: 1, padding: 10, borderRadius: 8, minHeight: 90 }} />

      <Text style={{ marginTop: 10, fontWeight: '700' }}>Generado en inglés (placeholder)</Text>

      <Text>Título breve (EN)</Text>
      <TextInput value={shortEn} onChangeText={setShortEn}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }} />

      <Text>Descripción larga (EN)</Text>
      <TextInput value={longEn} onChangeText={setLongEn}
        multiline
        style={{ borderWidth: 1, padding: 10, borderRadius: 8, minHeight: 110 }} />

      <Text>Resolución (EN)</Text>
      <TextInput value={resolutionEn} onChangeText={setResolutionEn}
        multiline
        style={{ borderWidth: 1, padding: 10, borderRadius: 8, minHeight: 90 }} />

      <Pressable
        onPress={save}
        disabled={saving}
        style={{ padding: 14, borderWidth: 1, borderRadius: 10, alignItems: 'center', opacity: saving ? 0.6 : 1 }}
      >
        <Text>{saving ? 'Guardando...' : 'Guardar ticket'}</Text>
      </Pressable>

      <Pressable
        onPress={() => router.back()}
        style={{ padding: 14, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
      >
        <Text>Cancelar</Text>
      </Pressable>
    </ScrollView>
  )
}
