import * as Crypto from 'expo-crypto'

export async function sha256(input: string) {
  // Expo Crypto funciona en Android/iOS y también en web con Expo
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input
  )
}
