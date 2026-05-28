import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { User, Award, Star, AlertCircle, CheckCircle } from 'lucide-react-native';
import { theme } from '@/theme';
import { useMyTrainer, usePublicTrainerProfile, useSendLinkRequest } from '../hooks/use-trainer-link';
import type { TrainerLinkStackParamList } from '@/navigation/types';

type ProfileRoute = RouteProp<TrainerLinkStackParamList, 'TrainerProfile'>;

export default function TrainerProfileScreen() {
  const route = useRoute<ProfileRoute>();
  const { trainerId } = route.params;
  const { data: profile, isLoading, isError, refetch } = usePublicTrainerProfile(trainerId);
  const { data: myTrainer, isLoading: isMyTrainerLoading } = useMyTrainer();
  const sendRequest = useSendLinkRequest();

  const linkedTrainerId = myTrainer?.trainer?.trainerId ?? null;
  const isLinkedTrainer = linkedTrainerId === trainerId;
  const hasDifferentActiveTrainer = Boolean(linkedTrainerId && linkedTrainerId !== trainerId);
  const isSendDisabled = sendRequest.isPending || isMyTrainerLoading || hasDifferentActiveTrainer;

  const getSendButtonText = () => {
    if (isMyTrainerLoading) return 'Validando vinculación...';
    if (hasDifferentActiveTrainer) return 'Ya tienes entrenador';
    if (sendRequest.isPending) return 'Enviando...';
    return 'Enviar solicitud de vinculación';
  };

  const handleSendRequest = () => {
    if (isMyTrainerLoading) return;

    if (isLinkedTrainer) {
      Alert.alert('Entrenador vinculado', 'Ya estás vinculado con este entrenador.');
      return;
    }

    if (hasDifferentActiveTrainer) {
      Alert.alert('Ya tienes un entrenador', 'Ya tienes un entrenador vinculado. Desvincúlate primero para enviar una nueva solicitud.');
      return;
    }

    Alert.alert(
      'Enviar solicitud',
      `¿Enviar solicitud de vinculación a ${profile?.displayName ?? 'este entrenador'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: () => {
            sendRequest.mutate(
              { trainerId },
              {
                onSuccess: () => {
                  Alert.alert('Solicitud enviada', 'Tu solicitud de vinculación ha sido enviada.');
                },
                onError: (err: Error) => {
                  Alert.alert('Error', err.message || 'No pudimos enviar la solicitud.');
                },
              },
            );
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <AlertCircle size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>No pudimos cargar el perfil</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            {profile.profileImageUrl ? (
              <Image source={{ uri: profile.profileImageUrl }} style={styles.avatarImage} />
            ) : (
              <User size={48} color={theme.colors.textSecondary} />
            )}
          </View>
          <Text style={styles.name}>{profile.displayName}</Text>
          <Text style={styles.code}>{profile.trainerCode}</Text>
        </View>

        {profile.specialties.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Especialidades</Text>
            <View style={styles.specialties}>
              {profile.specialties.map((s, i) => (
                <View key={i} style={styles.badge}>
                  <Award size={14} color={theme.colors.primary} />
                  <Text style={styles.badgeText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experiencia</Text>
          <View style={styles.experienceRow}>
            <Star size={16} color={theme.colors.warning} />
            <Text style={styles.experienceText}>{profile.yearsOfExperience} años</Text>
          </View>
        </View>

        {profile.shortBio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acerca de</Text>
            <Text style={styles.bio}>{profile.shortBio}</Text>
          </View>
        )}

        {isLinkedTrainer ? (
          <View style={styles.linkedStatus}>
            <CheckCircle size={20} color="#22C55E" />
            <Text style={styles.linkedStatusText}>Ya estás vinculado con este entrenador</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.sendButton, isSendDisabled && styles.sendButtonDisabled]}
              onPress={handleSendRequest}
              disabled={isSendDisabled}
            >
              {sendRequest.isSuccess ? (
                <>
                  <CheckCircle size={20} color="#0A0A0F" />
                  <Text style={styles.sendText}>Solicitud enviada</Text>
                </>
              ) : (
                <Text style={[styles.sendText, isSendDisabled && styles.sendTextDisabled]}>
                  {getSendButtonText()}
                </Text>
              )}
            </TouchableOpacity>
            {hasDifferentActiveTrainer && (
              <Text style={styles.blockedHelp}>
                Para enviar una nueva solicitud, primero desvincúlate de tu entrenador actual.
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    padding: 16,
    gap: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#2A2A3E',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  code: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: 'monospace',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0A0B0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  badgeText: {
    fontSize: 13,
    color: theme.colors.primary,
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  experienceText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  bio: {
    fontSize: 14,
    color: '#A0A0B0',
    lineHeight: 20,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#2A2A3E',
  },
  sendText: {
    color: '#0A0A0F',
    fontWeight: '700',
    fontSize: 15,
  },
  sendTextDisabled: {
    color: '#A0A0B0',
  },
  linkedStatus: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  linkedStatusText: {
    color: '#22C55E',
    fontWeight: '700',
    fontSize: 15,
  },
  blockedHelp: {
    color: '#A0A0B0',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: -8,
  },
  errorText: {
    fontSize: 15,
    color: '#EF4444',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    color: '#0A0A0F',
    fontWeight: '700',
  },
});
