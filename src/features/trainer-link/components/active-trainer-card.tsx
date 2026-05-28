import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { User, Award, Star } from 'lucide-react-native';
import { theme } from '@/theme';
import type { ActiveTrainerResponse } from '../types/trainer-link';

interface Props {
  data: NonNullable<ActiveTrainerResponse['trainer']>;
  onViewProfile: () => void;
  onDeactivate: () => void;
}

export default function ActiveTrainerCard({ data, onViewProfile, onDeactivate }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        {data.profileImageUrl ? (
          <Image source={{ uri: data.profileImageUrl }} style={styles.avatarImage} />
        ) : (
          <User size={40} color={theme.colors.textSecondary} />
        )}
      </View>
      <Text style={styles.name}>{data.displayName}</Text>
      <Text style={styles.code}>{data.trainerCode}</Text>
      <View style={styles.specialties}>
        {data.specialties.map((s, i) => (
          <View key={i} style={styles.badge}>
            <Text style={styles.badgeText}>{s}</Text>
          </View>
        ))}
      </View>
      <View style={styles.experience}>
        <Star size={14} color={theme.colors.warning} />
        <Text style={styles.experienceText}>{data.yearsOfExperience} años de experiencia</Text>
      </View>
      <Text style={styles.date}>
        Vinculado desde {new Date(data.activatedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.profileButton} onPress={onViewProfile}>
          <Text style={styles.profileText}>Ver perfil completo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deactivateButton} onPress={onDeactivate}>
          <Text style={styles.deactivateText}>Desvincularme</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2A2A3E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  code: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: 'monospace',
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    color: theme.colors.primary,
  },
  experience: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  experienceText: {
    fontSize: 13,
    color: '#A0A0B0',
  },
  date: {
    fontSize: 12,
    color: '#A0A0B0',
    marginTop: 4,
  },
  actions: {
    width: '100%',
    gap: 8,
    marginTop: 12,
  },
  profileButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  profileText: {
    color: '#0A0A0F',
    fontWeight: '700',
    fontSize: 14,
  },
  deactivateButton: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deactivateText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },
});
