// app/ticket/edit/[id].tsx
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { supabase } from '../../../src/lib/supabase'

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
  const [shortEn, setShortEn] = useState('')
  const [longEn, setLongEn] = useState('')
  const [resolutionEn, setResolutionEn] = useState('')
  const [status, setStatus] = useState<'open' | 'resolved'>('open')

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from('tickets').select('*').eq('id', id).single()
    if (error) {
      Alert.alert('Error', error.message)
      setLoading(false)
      return
    }

    setCustomerName(data.customer_name ?? '')
    setSid(data.sid ?? '')
    setFloor(data.floor ?? '')
    setLocationOptional(data.location_optional ?? '')
    setProblemEs(data.problem_es ?? '')
    setSolutionEs(data.solution_es ?? '')
    setShortEn(data.short_en ?? '')
    setLongEn(data.long_en ?? '')
    setResolutionEn(data.resolution_en ?? '')
    setStatus((data.status ?? 'open') as 'open' | 'resolved')

    setLoading(false)
  }

  async function save() {
    if (!customerName.trim() || !sid.trim() || !floor.trim() || !problemEs.trim()) {
      return Alert.alert('Faltan datos', 'Nombre, SID, Piso y Problema son obligatorios.')
    }

    setSaving(true)
    try {
      const payload = {
        customer_name: customerName.trim(),
        sid: sid.trim(),
        floor: floor.trim(),
        location_optional: locationOptional.trim() || null,
        problem_es: problemEs.trim(),
        solution_es: solutionEs.trim() || null,
        short_en: shortEn.trim() || null,
        long_en: longEn.trim() || null,
        resolution_en: resolutionEn.trim() || null,
        status: (solutionEs.trim() ? 'resolved' : status) as 'open' | 'resolved',
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

  useEffect(() => {
    load()
  }, [id])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>✏️ Editar Ticket</Text>
      <Text style={{ opacity: 0.7 }}>ID: {id}</Text>

      <Text>Nombre</Text>
      <TextInput
        value={customerName}
        onChangeText={setCustomerName}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <Text>SID</Text>
      <TextInput
        value={sid}
        onChangeText={setSid}
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <Text>Piso</Text>
      <TextInput
        value={floor}
        onChangeText={setFloor}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <Text>Ubicación (opcional)</Text>
      <TextInput
        value={locationOptional}
        onChangeText={setLocationOptional}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <Text>Problema (ES)</Text>
      <TextInput
        value={problemEs}
        onChangeText={setProblemEs}
        multiline
        style={{ borderWidth: 1, padding: 10, borderRadius: 8, minHeight: 90 }}
      />

      <Text>Solución (ES) (opcional)</Text>
      <TextInput
        value={solutionEs}
        onChangeText={setSolutionEs}
        multiline
        style={{ borderWidth: 1, padding: 10, borderRadius: 8, minHeight: 90 }}
      />

      <Text style={{ marginTop: 10, fontWeight: '700' }}>Campos EN</Text>

      <Text>Título breve (EN)</Text>
      <TextInput
        value={shortEn}
        onChangeText={setShortEn}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <Text>Descripción larga (EN)</Text>
      <TextInput
        value={longEn}
        onChangeText={setLongEn}
        multiline
        style={{ borderWidth: 1, padding: 10, borderRadius: 8, minHeight: 110 }}
      />

      <Text>Resolución (EN)</Text>
      <TextInput
        value={resolutionEn}
        onChangeText={setResolutionEn}
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
        <Text>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
      </Pressable>

      <Pressable
        onPress={() => router.replace(`/ticket/${id}`)}
        style={{ padding: 14, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
      >
        <Text>Cancelar</Text>
      </Pressable>
    </ScrollView>
  )
}
