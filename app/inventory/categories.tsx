// app/inventory/categories.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native'
import { supabase } from '../../src/lib/supabase'

type InventoryCategory = {
  id: string
  name: string
  description: string | null
}

export default function InventoryCategoriesScreen() {
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [saving, setSaving] = useState(false)

  async function loadCategories() {
    setLoading(true)
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('id, name, description')
      .order('name', { ascending: true })

    if (error) {
      console.log('Error cargando categorías:', error)
      setCategories([])
    } else {
      setCategories((data ?? []) as InventoryCategory[])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadCategories()
  }, [])

  async function addCategory() {
    const name = newName.trim()
    const description = newDescription.trim() || null

    if (!name) {
      return Alert.alert('Falta nombre', 'Escribe un nombre para la categoría.')
    }

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('inventory_categories')
        .insert({ name, description })
        .select('id, name, description')
        .single()

      if (error) throw error

      setNewName('')
      setNewDescription('')
      setCategories((prev) => [...prev, data as InventoryCategory])
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '900' }}>🏷️ Categorías de inventario</Text>

      {/* Formulario para nueva categoría */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: '800' }}>Nueva categoría</Text>
        <TextInput
          placeholder="Ej. Cables, Monitores, Video…"
          value={newName}
          onChangeText={setNewName}
          style={{ borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 }}
        />
        <TextInput
          placeholder="Descripción (opcional)"
          value={newDescription}
          onChangeText={setNewDescription}
          multiline
          style={{ borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 }}
        />
        <Pressable
          onPress={addCategory}
          disabled={saving}
          style={{
            padding: 12,
            borderWidth: 1,
            borderRadius: 10,
            alignItems: 'center',
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Text>{saving ? 'Guardando…' : 'Agregar categoría'}</Text>
        </Pressable>
      </View>

      {/* Lista de categorías */}
      <View style={{ flex: 1, marginTop: 12 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 6 }}>Cargando categorías…</Text>
          </View>
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text>No hay categorías aún.</Text>}
            renderItem={({ item }) => (
              <View
                style={{
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontWeight: '800' }}>{item.name}</Text>
                {item.description ? (
                  <Text style={{ fontSize: 12, opacity: 0.8 }}>{item.description}</Text>
                ) : null}
              </View>
            )}
          />
        )}
      </View>
    </View>
  )
}
