// app/inventory/new.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../../src/lib/supabase'
import { loadSession } from '../../src/lib/session'
import { router } from 'expo-router'

type InventoryCategory = {
  id: string
  name: string
}

const INVENTORY_BUCKET = 'inventory-photos' // usa el nombre de tu bucket

export default function InventoryNewScreen() {
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [status, setStatus] = useState<'new' | 'used' | 'defective'>('new')
  const [comments, setComments] = useState('')

  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    setLoadingCategories(true)
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) {
      console.log('Error cargando categorías:', error)
      setCategories([])
    } else {
      setCategories((data ?? []) as InventoryCategory[])
    }
    setLoadingCategories(false)
  }

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  async function addCategoryInline() {
    const name = newCategoryName.trim()
    if (!name) return
    setAddingCategory(true)

    try {
      const { data, error } = await supabase
        .from('inventory_categories')
        .insert({ name })
        .select('id, name')
        .single()

      if (error) throw error

      setNewCategoryName('')
      setCategories((prev) => [...prev, data as InventoryCategory])
      setSelectedCategoryIds((prev) => [...prev, (data as InventoryCategory).id])
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? String(e))
    } finally {
      setAddingCategory(false)
    }
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para elegir fotos.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri)
    }
  }

  async function uploadPhotoIfNeeded(): Promise<string | null> {
    if (!photoUri) return null

    try {
      setUploadingPhoto(true)
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

      const response = await fetch(photoUri)
      const blob = await response.blob()

      const { error: uploadError } = await supabase.storage
        .from(INVENTORY_BUCKET)
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(INVENTORY_BUCKET).getPublicUrl(fileName)
      return data.publicUrl ?? null
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function saveItem() {
    if (!name.trim())
      return Alert.alert('Falta nombre', 'Escribe un nombre para el equipo.')
    const qty = parseInt(quantity, 10)
    if (isNaN(qty) || qty < 0) {
      return Alert.alert('Cantidad inválida', 'La cantidad debe ser un número mayor o igual a 0.')
    }

    setSaving(true)

    try {
      const session = await loadSession()
      const createdBy = session?.id ?? null

      const photoUrl = await uploadPhotoIfNeeded()

      const { data: itemData, error: insertError } = await supabase
        .from('inventory_items')
        .insert({
          name: name.trim(),
          quantity: qty,
          status,
          comments: comments.trim() || null,
          photo_url: photoUrl,
          created_by: createdBy,
        })
        .select('id')
        .single()

      if (insertError) throw insertError

      const itemId = itemData.id as string

      if (selectedCategoryIds.length > 0) {
        const rows = selectedCategoryIds.map((catId) => ({
          item_id: itemId,
          category_id: catId,
        }))

        const { error: catError } = await supabase
          .from('inventory_item_categories')
          .insert(rows)

        if (catError) throw catError
      }

      Alert.alert('Guardado', 'Equipo guardado en inventario.')
      // 🔴 aquí el cambio: redirigimos a /inventory (inventory/index.tsx)
      router.replace('/inventory')
    } catch (e: any) {
      console.log('Error guardando item:', e)
      Alert.alert('Error', e?.message ?? String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '900' }}>➕ Nuevo equipo en inventario</Text>

      {/* Nombre */}
      <Text style={{ fontWeight: '800' }}>Nombre</Text>
      <TextInput
        placeholder="Ej. Monitor Dell 24”"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, borderRadius: 10, padding: 10 }}
      />

      {/* Cantidad */}
      <Text style={{ fontWeight: '800' }}>Cantidad</Text>
      <TextInput
        placeholder="Ej. 10"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderRadius: 10, padding: 10 }}
      />

      {/* Estado */}
      <Text style={{ fontWeight: '800' }}>Estado</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['new', 'used', 'defective'] as const).map((value) => (
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
            <Text>
              {value === 'new' ? 'Nuevo' : value === 'used' ? 'Usado' : 'Defectuoso'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Comentarios */}
      <Text style={{ fontWeight: '800' }}>Comentarios</Text>
      <TextInput
        placeholder="Ej. Guardados en caja, revisión pendiente…"
        value={comments}
        onChangeText={setComments}
        multiline
        style={{ borderWidth: 1, borderRadius: 10, padding: 10, minHeight: 80 }}
      />

      {/* Foto */}
      <Text style={{ fontWeight: '800' }}>Foto</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={{ width: 64, height: 64, borderRadius: 8, borderWidth: 1 }}
          />
        ) : (
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 8,
              borderWidth: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 10, textAlign: 'center' }}>Sin foto</Text>
          </View>
        )}

        <Pressable
          onPress={pickImage}
          style={{ paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderRadius: 10 }}
        >
          <Text>Elegir foto</Text>
        </Pressable>

        {uploadingPhoto && <ActivityIndicator />}
      </View>

      {/* Categorías */}
      <Text style={{ fontWeight: '800', marginTop: 8 }}>Categorías</Text>
      {loadingCategories ? (
        <ActivityIndicator />
      ) : categories.length === 0 ? (
        <Text style={{ opacity: 0.7 }}>Aún no hay categorías. Crea alguna abajo.</Text>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {categories.map((cat) => {
            const selected = selectedCategoryIds.includes(cat.id)
            return (
              <Pressable
                key={cat.id}
                onPress={() => toggleCategory(cat.id)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  backgroundColor: selected ? '#ddd' : 'transparent',
                }}
              >
                <Text>{cat.name}</Text>
              </Pressable>
            )
          })}
        </View>
      )}

      {/* Crear categoría inline */}
      <View style={{ marginTop: 8, gap: 8 }}>
        <Text style={{ fontWeight: '800' }}>Agregar nueva categoría</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            placeholder="Ej. Cables de video"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            style={{ flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10 }}
          />
          <Pressable
            onPress={addCategoryInline}
            disabled={addingCategory}
            style={{
              paddingHorizontal: 12,
              justifyContent: 'center',
              borderWidth: 1,
              borderRadius: 10,
              opacity: addingCategory ? 0.6 : 1,
            }}
          >
            <Text>Agregar</Text>
          </Pressable>
        </View>
      </View>

      {/* Guardar */}
      <Pressable
        onPress={saveItem}
        disabled={saving}
        style={{
          marginTop: 12,
          padding: 14,
          borderWidth: 1,
          borderRadius: 10,
          alignItems: 'center',
          opacity: saving ? 0.6 : 1,
        }}
      >
        <Text>{saving ? 'Guardando…' : 'Guardar en inventario'}</Text>
      </Pressable>
    </ScrollView>
  )
}
