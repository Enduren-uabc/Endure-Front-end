import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { theme } from '@/theme';

interface Props {
  onAccept: () => void;
  onReject: () => void;
  acceptLoading?: boolean;
  rejectLoading?: boolean;
}

export default function LinkRequestActions({ onAccept, onReject, acceptLoading, rejectLoading }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.rejectButton}
        onPress={() => {
          Alert.alert(
            'Rechazar solicitud',
            '¿Estás seguro de rechazar esta solicitud? Puedes agregar un motivo opcional.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Rechazar', style: 'destructive', onPress: onReject },
            ],
          );
        }}
        disabled={rejectLoading}
      >
        <Text style={styles.rejectText}>{rejectLoading ? '...' : 'Rechazar'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => {
          Alert.alert(
            'Aceptar solicitud',
            'Al aceptar, se creará un vínculo activo con este cliente.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Aceptar', onPress: onAccept },
            ],
          );
        }}
        disabled={acceptLoading}
      >
        <Text style={styles.acceptText}>{acceptLoading ? '...' : 'Aceptar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rejectText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 13,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  acceptText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
