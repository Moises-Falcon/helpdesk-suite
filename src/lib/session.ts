import AsyncStorage from '@react-native-async-storage/async-storage'

export const SESSION_KEY = 'HELPDESK_SESSION'

export type SessionUser = {
  id: string
  username: string
  full_name?: string | null
}

export async function saveSession(user: SessionUser) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export async function loadSession(): Promise<SessionUser | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY)
}
