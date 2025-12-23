// src/lib/session.ts
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const SESSION_KEY = 'HELPDESK_SESSION'

export type SessionUser = {
  id: string
  username: string
  full_name?: string | null
}

// --- Helpers de storage (web vs native) ---
async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(key, value)
    return
  }
  await AsyncStorage.setItem(key, value)
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return window.localStorage.getItem(key)
  }
  return await AsyncStorage.getItem(key)
}

async function removeItem(key: string) {
  if (Platform.OS === 'web') {
    window.localStorage.removeItem(key)
    return
  }
  await AsyncStorage.removeItem(key)
}

// --- API ---
export async function saveSession(user: SessionUser) {
  await setItem(SESSION_KEY, JSON.stringify(user))
}

export async function loadSession(): Promise<SessionUser | null> {
  const raw = await getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}

export async function clearSession() {
  await removeItem(SESSION_KEY)
}
