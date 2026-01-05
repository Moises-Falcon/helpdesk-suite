// app/inventory/reports.tsx
import React from 'react'
import { View, Text } from 'react-native'

export default function InventoryReportsScreen() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '900' }}>📊 Reportes de inventario</Text>
      <Text style={{ opacity: 0.8 }}>
        Aquí podrás generar reportes diarios, semanales, mensuales y anuales, exportar a
        Excel/CSV y generar PDFs con gráficas.
      </Text>

      <Text style={{ marginTop: 12 }}>
        Próximamente: filtros por rango de fechas, categorías, ubicaciones y exportación
        directa al dispositivo.
      </Text>
    </View>
  )
}
