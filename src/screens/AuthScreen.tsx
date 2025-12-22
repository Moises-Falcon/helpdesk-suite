import React, { useMemo, useState } from 'react'
import { View, Text, TextInput, Pressable, Alert } from 'react-native'
import { supabase } from '../lib/supabase'
import { sha256 } from '../lib/hash'
import { saveSession, SessionUser } from '../lib/session'

export default function AuthScreen({ onAuthed }: { onAuthed: () => void }) {
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const cleanUser = useMemo(() => username.trim().toLowerCase(), [username])

  async function register() {
    const u = cleanUser
    if (!u) return Alert.alert('Falta usuario', 'Ej: jperez')
    if (!password) return Alert.alert('Falta contraseña')
    if (password.length < 4)
      return Alert.alert('Contraseña muy corta', 'Mínimo 4 caracteres (interna).')

    setLoading(true)
    try {
      const password_hash = await sha256(password)

      const { data, error } = await supabase
        .from('users')
        .insert({
          username: u,
          full_name: fullName.trim() || null,
          password_hash,
        })
        .select('id, username, full_name')
        .single()

      if (error) throw error

      await saveSession(data as SessionUser)
      onAuthed()
    } catch (e: any) {
      Alert.alert('Error al crear usuario', e?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }

  async function login() {
    const u = cleanUser
    if (!u) return Alert.alert('Falta usuario')
    if (!password) return Alert.alert('Falta contraseña')

    setLoading(true)
    try {
      const password_hash = await sha256(password)

      const { data, error } = await supabase
        .from('users')
        .select('id, username, full_name, password_hash')
        .eq('username', u)
        .single()

      if (error) throw error
      if (!data) throw new Error('Usuario no existe')

      if (data.password_hash !== password_hash) {
        throw new Error('Contraseña incorrecta')
      }

      const sessionUser: SessionUser = {
        id: data.id,
        username: data.username,
        full_name: data.full_name,
      }

      await saveSession(sessionUser)
      onAuthed()
    } catch (e: any) {
      Alert.alert('Error al iniciar sesión', e?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ padding: 16, gap: 10, maxWidth: 520 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Helpdesk Suite</Text>

      <Text>Usuario</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholder="ej: jperez"
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <Text>Nombre (opcional)</Text>
      <TextInput
        value={fullName}
        onChangeText={setFullName}
        placeholder="Juan Pablo"
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <Text>Contraseña</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••"
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <Pressable
        onPress={login}
        disabled={loading}
        style={{
          padding: 12,
          borderWidth: 1,
          borderRadius: 10,
          alignItems: 'center',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Text>{loading ? '...' : 'Iniciar sesión'}</Text>
      </Pressable>

      <Pressable
        onPress={register}
        disabled={loading}
        style={{
          padding: 12,
          borderWidth: 1,
          borderRadius: 10,
          alignItems: 'center',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Text>{loading ? '...' : 'Crear usuario'}</Text>
      </Pressable>
    </View>
  )
}
