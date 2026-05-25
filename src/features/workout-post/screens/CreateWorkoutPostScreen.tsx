import React from 'react';
import { ActivityIndicator, Alert, Image, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, ImagePlus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import { useWorkoutSessionDetail } from '@/features/training/hooks/use-workout-session';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { api, apiClient } from '@/lib/api-client';
import type { WorkoutStackParamList, AppTabsParamList } from '@/navigation/types';
import { useCreateWorkoutPost } from '../hooks/use-create-workout-post';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'CreateWorkoutPost'>;

function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k kg`;
  return `${Math.round(kg)} kg`;
}

function formatDuration(min: number | null): string {
  if (!min) return '—';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

export default function CreateWorkoutPostScreen({ route }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<AppTabsParamList>>();
  const { data: session, isLoading, isError, refetch } = useWorkoutSessionDetail(route.params.sessionId);
  const createPost = useCreateWorkoutPost();
  const [caption, setCaption] = React.useState('');
  const [mediaUrls, setMediaUrls] = React.useState<string[]>([]);

  const totalSets = session?.exercises?.reduce(
    (sum, ex) => sum + (ex.workoutSets?.length ?? ex.targetSets?.length ?? 0), 0
  ) ?? 0;
  const completedSets = session?.exercises?.reduce(
    (sum, ex) => sum + (ex.workoutSets?.filter((s) => s.completed).length ?? 0), 0
  ) ?? 0;
  const totalVolume = session?.exercises?.reduce((sum, ex) => {
    return sum + (ex.workoutSets?.reduce((s, set) => {
      return s + ((set.weightUsed ?? 0) * (set.repsPerformed ?? 0));
    }, 0) ?? 0);
  }, 0) ?? 0;

  const pickFromGallery = React.useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galeria para agregar fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 10 - mediaUrls.length,
    });

    if (result.canceled || !result.assets.length) return;

    const newUris = result.assets.map((asset) => asset.uri);
    setMediaUrls((prev) => [...prev, ...newUris].slice(0, 10));
  }, [mediaUrls.length]);

  const pickFromCamera = React.useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu camara para tomar fotos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setMediaUrls((prev) => [...prev, result.assets[0].uri].slice(0, 10));
  }, []);

  const handleAddMedia = React.useCallback(() => {
    Alert.alert('Agregar foto', 'Selecciona el origen de la imagen', [
      {
        text: 'Galeria',
        onPress: pickFromGallery,
      },
      {
        text: 'Camara',
        onPress: pickFromCamera,
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }, [pickFromGallery, pickFromCamera]);

  const [isUploading, setIsUploading] = React.useState(false);

  const handlePublish = async () => {
    setIsUploading(true);
    try {
      let resolvedUrls: string[] | undefined;

      if (mediaUrls.length > 0) {
        const uploadedUrls: string[] = [];
        for (const uri of mediaUrls) {
          const formData = new FormData();
          const filename = uri.split('/').pop() ?? 'photo.jpg';
          formData.append('file', {
            uri,
            name: filename,
            type: 'image/jpeg',
          } as unknown as Blob);

          const { data } = await api.post<{ url: string }>(
            API_ENDPOINTS.publications.uploadMedia,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } },
          );
          uploadedUrls.push(data.url);
        }
        resolvedUrls = uploadedUrls;
      }

      createPost.mutate(
        {
          sessionId: route.params.sessionId,
          caption: caption.trim() || undefined,
          mediaUrls: resolvedUrls,
        },
        {
          onSuccess: () => {
            navigation.getParent()?.navigate('MainTabs', { screen: 'Social', params: { screen: 'SocialFeed' } });
          },
          onError: () => {
            Alert.alert('Error', 'No se pudo publicar. Revisa tu conexión.');
          },
        },
      );
    } catch {
      Alert.alert('Error', 'No se pudieron subir las imagenes. Revisa tu conexión.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.centerText}>Cargando resumen del entrenamiento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.centerTitle}>No pudimos cargar el entrenamiento</Text>
          <SecondaryButton label="Reintentar" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <ArrowLeft size={22} color={theme.colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerSubtitle}>Configurar publicación</Text>
        </View>
        <Pressable 
          style={[styles.publishHeaderBtn, (isUploading || createPost.isPending) && styles.disabledBtn]} 
          onPress={handlePublish}
          disabled={isUploading || createPost.isPending}
        >
          <Text style={styles.publishHeaderBtnText}>
            {isUploading ? '...' : createPost.isPending ? '...' : 'Publicar'}
          </Text>
        </Pressable>
      </View>

      <ScrollView 
        style={styles.form} 
        contentContainerStyle={styles.formContent} 
        keyboardShouldPersistTaps="handled" 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mediaSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaScroll}>
            {mediaUrls.length < 10 && (
              <Pressable style={styles.addMediaBig} onPress={handleAddMedia}>
                <View style={styles.addMediaIconCircle}>
                  <Camera size={28} color={theme.colors.primary} />
                </View>
                <Text style={styles.addMediaTextBig}>Agregar fotos</Text>
              </Pressable>
            )}
            {mediaUrls.map((url, index) => (
              <View key={index} style={styles.mediaLargeThumb}>
                <Image source={{ uri: url }} style={styles.mediaLargeImage} />
                <Pressable
                  style={styles.removeMediaLarge}
                  onPress={() => setMediaUrls((prev) => prev.filter((_, i) => i !== index))}
                >
                  <X size={16} color="white" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputSection}>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="¿Cómo te sentiste hoy? Escribe algo..."
            placeholderTextColor={theme.colors.textMuted}
            style={styles.captionInput}
            multiline
            editable={!createPost.isPending}
            maxLength={2000}
          />
        </View>

        <View style={styles.previewSection}>
          <View style={styles.previewCardMini}>
            <View style={styles.previewCardContent}>
              <Text style={styles.previewRoutineName}>{session.routineName ?? 'Entrenamiento'}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{formatDuration(session.durationMinutes)}</Text>
                  <Text style={styles.statLabel}>Duración</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{formatVolume(totalVolume)}</Text>
                  <Text style={styles.statLabel}>Volumen</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{completedSets}</Text>
                  <Text style={styles.statLabel}>Series</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
  },
  publishHeaderBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  publishHeaderBtnText: {
    color: theme.colors.primary,
    fontSize: theme.typography.bodyStrong.fontSize,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  form: {
    flex: 1,
  },
  formContent: {
    paddingBottom: theme.spacing.xl,
  },
  mediaSection: {
    marginTop: theme.spacing.lg,
  },
  mediaScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  addMediaBig: {
    width: 140,
    height: 180,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  addMediaIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMediaTextBig: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
  },
  mediaLargeThumb: {
    width: 140,
    height: 180,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  mediaLargeImage: {
    width: '100%',
    height: '100%',
  },
  removeMediaLarge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputSection: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  captionInput: {
    minHeight: 120,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: 28,
    textAlignVertical: 'top',
    padding: 0,
  },
  previewSection: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  previewCardMini: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  previewCardContent: {
    gap: theme.spacing.lg,
  },
  previewRoutineName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    fontWeight: '700',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: theme.typography.bodyStrong.fontSize,
    fontWeight: '700',
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: theme.colors.border,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
  centerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: '700',
    textAlign: 'center',
  },
  centerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    textAlign: 'center',
  },
});
