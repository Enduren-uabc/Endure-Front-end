import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TextInput as RNTextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImageUp } from 'lucide-react-native';
import { TextInput } from '@/components/ui/TextInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { OnboardingStepIndicator } from '@/features/onboarding/components/OnboardingStepIndicator';
import type { OnboardingStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SocialSetup'>;

export default function SocialSetupScreen({ navigation }: Props) {
  const username = useSessionStore((s) => s.username) ?? 'usuario';
  const [displayName, setDisplayName] = React.useState(username.replace(/_/g, ' '));
  const [bio, setBio] = React.useState('');
  const [avatarUri, setAvatarUri] = React.useState<string | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<{ uri: string; name: string; type: string } | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const pickFromGallery = React.useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setAvatarUri(asset.uri);
    setAvatarFile({
      uri: asset.uri,
      name: asset.fileName ?? 'avatar.jpg',
      type: asset.mimeType ?? 'image/jpeg',
    });
  }, []);

  const pickFromCamera = React.useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setAvatarUri(asset.uri);
    setAvatarFile({
      uri: asset.uri,
      name: asset.fileName ?? 'camera.jpg',
      type: asset.mimeType ?? 'image/jpeg',
    });
  }, []);

  const showImagePicker = React.useCallback(() => {
    if (Platform.OS === 'ios') {
      const { ActionSheetIOS } = require('react-native');
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Tomar foto', 'Elegir de galería'],
          cancelButtonIndex: 0,
        },
        (index: number) => {
          if (index === 1) pickFromCamera();
          if (index === 2) pickFromGallery();
        },
      );
    } else {
      pickFromGallery();
    }
  }, [pickFromCamera, pickFromGallery]);

  const handleSubmit = React.useCallback(async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('displayName', displayName.trim() || username);
      formData.append('bio', bio.trim());
      if (avatarFile) {
        formData.append('avatar', avatarFile as unknown as Blob);
      }
      await apiClient.postMultipart(API_ENDPOINTS.onboarding.social, formData);
      navigation.navigate('Summary');
    } catch (err) {
      console.error('Error al guardar perfil social:', err);
    } finally {
      setIsSaving(false);
    }
  }, [displayName, bio, username, avatarFile, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <OnboardingStepIndicator currentStep={4} showSocial />

        <Text style={styles.title}>Tu perfil social</Text>
        <Text style={styles.subtitle}>Preséntate a la comunidad</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Nombre de usuario</Text>
          <View style={styles.readonlyField}>
            <Text style={styles.readonlyText}>@{username}</Text>
          </View>
          <Text style={styles.fieldHint}>Este es tu identificador único y no se puede cambiar</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Nombre para mostrar</Text>
          <TextInput
            label=""
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Tu nombre en Endure"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Biografía</Text>
          <Text style={styles.fieldHint}>Opcional — cuéntanos de ti</Text>
          <View style={styles.bioInputWrapper}>
            <RNTextInput
              style={styles.bioInput}
              value={bio}
              onChangeText={setBio}
              placeholder="Ej. Apasionado del fitness"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Foto de perfil</Text>
          <Text style={styles.fieldHint}>Opcional — puedes agregarla después</Text>
          <SecondaryButton
            label={avatarUri ? 'Cambiar foto' : 'Agregar foto'}
            onPress={showImagePicker}
            style={styles.photoButton}
          />
          {avatarUri ? (
            <View style={styles.avatarPreview}>
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              <View style={styles.avatarIcons}>
                <ImageUp size={16} color={theme.colors.primary} />
                <Text style={styles.avatarLabel}>Foto lista</Text>
              </View>
            </View>
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Camera size={32} color={theme.colors.textMuted} />
              <Text style={styles.avatarPlaceholderText}>Toca para agregar una foto</Text>
            </View>
          )}
        </View>

        <PrimaryButton
          label={isSaving ? 'Guardando...' : 'Continuar'}
          onPress={handleSubmit}
          loading={isSaving}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: '800',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    marginTop: -theme.spacing.sm,
  },
  fieldGroup: {
    gap: theme.spacing.xs,
  },
  fieldLabel: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '700',
  },
  fieldHint: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  readonlyField: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  readonlyText: {
    color: theme.colors.primary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '700',
  },
  bioInputWrapper: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  bioInput: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    minHeight: 80,
  },
  photoButton: {
    alignSelf: 'flex-start',
  },
  avatarPreview: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  avatarLabel: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '600',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    borderWidth: 2,
    borderColor: theme.colors.borderSoft,
    borderStyle: 'dashed',
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
  },
  avatarPlaceholderText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
});
