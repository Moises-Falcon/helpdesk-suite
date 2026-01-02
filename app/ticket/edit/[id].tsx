import React, { useEffect, useState } from 'react'
import { Text, TextInput, Pressable, Alert, ScrollView, ActivityIndicator, View } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
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

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [resolution, setResolution] = useState('')

  async function load() {
    if (!id) return
    setLoading(true)
    const { data, error } = await supabase.from('tickets').select('*').eq('id', id).single()

    if (error) {
      console.log('EDIT load error:', error)
      Alert.alert('Error', 'No se pudo cargar el ticket.')
      setLoading(false)
      return
    }

    setCustomerName(data.customer_name ?? '')
    setSid(data.sid ?? '')
    setFloor(data.floor ?? '')
    setLocationOptional(data.location_optional ?? '')
    setProblemEs(data.problem_es ?? '')
    setSolutionEs(data.solution_es ?? '')

    setTitle(data.short_en ?? '')
    setDescription(data.long_en ?? '')
    setResolution(data.resolution_en ?? '')

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [id])

  async function save() {
    if (!id) return
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
        short_en: title.trim() || null,
        long_en: description.trim() || null,
        resolution_en: resolution.trim() || null,
        status: (solutionEs.trim() || resolution.trim()) ? 'resolved' : 'open',
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

      <Text style={{ fontWeight: '800' }}>Solución (opcional)</Text>
      <TextInput
        value={solutionEs}
        onChangeText={setSolutionEs}
        multiline
        style={{ borderWidth: 1, padding: 10, borderRadius: 8, minHeight: 90 }}
      />

      <Text style={{ marginTop: 10, fontWeight: '800' }}>Resumen</Text>

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
