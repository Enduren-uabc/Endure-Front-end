import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { User, Star } from 'lucide-react-native';
import { theme } from '@/theme';
import type { TrainerSearchResult } from '../types/trainer-link';

export type TrainerSearchSendState = 'available' | 'linked' | 'blocked';

interface Props {
  trainer: TrainerSearchResult;
  onSendRequest: (trainerId: string) => void;
  onViewProfile: (trainerId: string) => void;
  sendState?: TrainerSearchSendState;
  disabled?: boolean;
}

export default function TrainerSearchCard({
  trainer,
  onSendRequest,
  onViewProfile,
  sendState,
  disabled,
}: Props) {
  const resolvedSendState: TrainerSearchSendState = sendState ?? (disabled ? 'blocked' : 'available');
  const isSendBlocked = resolvedSendState === 'blocked';
  const isLinked = resolvedSendState === 'linked';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onViewProfile(trainer.userId)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        {trainer.profileImageUrl ? (
          <Image source={{ uri: trainer.profileImageUrl }} style={styles.avatarImage} />
        ) : (
          <User size={24} color={theme.colors.textSecondary} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{trainer.displayName}</Text>
        <Text style={styles.code}>{trainer.trainerCode}</Text>
        <View style={styles.specialties}>
          {trainer.specialties.slice(0, 3).map((s, i) => (
            <View key={i} style={styles.specialtyBadge}>
              <Text style={styles.specialtyText}>{s}</Text>
            </View>
          ))}
        </View>
        <View style={styles.experience}>
          <Star size={14} color={theme.colors.warning} />
          <Text style={styles.experienceText}>{trainer.yearsOfExperience} años de experiencia</Text>
        </View>
      </View>
      {isLinked ? (
        <View style={styles.linkedBadge}>
          <Text style={styles.linkedBadgeText}>Vinculado</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.sendButton, isSendBlocked && styles.sendButtonDisabled]}
          onPress={() => onSendRequest(trainer.userId)}
          disabled={isSendBlocked}
        >
          <Text style={[styles.sendButtonText, isSendBlocked && styles.sendButtonTextDisabled]}>
            {isSendBlocked ? 'No disponible' : 'Enviar'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A2A3E',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  code: {
    fontSize: 12,
    color: theme.colors.primary,
    fontFamily: 'monospace',
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  specialtyBadge: {
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  specialtyText: {
    fontSize: 10,
    color: theme.colors.primary,
  },
  experience: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  experienceText: {
    fontSize: 12,
    color: '#A0A0B0',
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#2A2A3E',
  },
  sendButtonText: {
    color: '#0A0A0F',
    fontWeight: '700',
    fontSize: 13,
  },
  sendButtonTextDisabled: {
    color: '#A0A0B0',
  },
  linkedBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  linkedBadgeText: {
    color: '#22C55E',
    fontWeight: '700',
    fontSize: 13,
  },
});
