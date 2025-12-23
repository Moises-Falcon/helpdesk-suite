// app/ticket/_layout.tsx
import React from 'react'
import { Stack } from 'expo-router'

export default function TicketLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ title: 'Ticket' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Editar Ticket' }} />
    </Stack>
  )
}
