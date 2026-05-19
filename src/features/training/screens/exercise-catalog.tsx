import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowLeft, Search, Dumbbell, Plus, Play, Image } from "lucide-react-native";
import { useExerciseCatalog } from "@/features/training/hooks/use-exercise-catalog";
import {
  EXERCISE_CATEGORIES,
  EXERCISE_CATEGORY_LABELS,
  type ExerciseCategory,
  type ExerciseCatalogItem,
} from "@/features/training/types/exercise-catalog";
import { useRoutineDraftStore } from "@/features/training/stores/routine-draft-store";
import { Chip } from "@/components/ui/Chip";
import { BaseCard } from "@/components/ui/BaseCard";
import { theme } from "@/theme";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ExerciseCatalogModal">;

export default function ExerciseCatalogScreen({ navigation }: Props) {
  const setPendingExerciseName = useRoutineDraftStore(
    (s) => s.setPendingExerciseName,
  );

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] =
    React.useState<ExerciseCategory | null>(null);

  const debounceTimerRef = React.useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);

  React.useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search]);

  const {
    data: exercises,
    isLoading,
    isError,
  } = useExerciseCatalog({
    search: debouncedSearch || undefined,
    category: selectedCategory ?? undefined,
  });

  const handleSelect = (exercise: ExerciseCatalogItem) => {
    setPendingExerciseName(exercise.name);
    navigation.goBack();
  };

  const handleCustomExercise = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Catálogo de Ejercicios</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.searchContainer}>
        <Search size={18} color={theme.colors.textMuted} />
        <RNTextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar ejercicio..."
          placeholderTextColor={theme.colors.textMuted}
          autoFocus
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
      >
        <Chip
          label="Todos"
          selected={selectedCategory === null}
          onPress={() => setSelectedCategory(null)}
        />
        {EXERCISE_CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={EXERCISE_CATEGORY_LABELS[cat]}
            selected={selectedCategory === cat}
            onPress={() =>
              setSelectedCategory((prev) => (prev === cat ? null : cat))
            }
          />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.listContent}>
        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Cargando ejercicios...</Text>
          </View>
        )}

        {isError && (
          <View style={styles.center}>
            <Text style={styles.errorText}>Error al cargar ejercicios</Text>
          </View>
        )}

        {!isLoading && !isError && exercises && exercises.length === 0 && (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No se encontraron ejercicios</Text>
          </View>
        )}

        {!isLoading &&
          !isError &&
          exercises &&
          exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              onPress={() => handleSelect(exercise)}
              activeOpacity={0.7}
            >
              <BaseCard style={styles.exerciseCard}>
                <View style={styles.exerciseRow}>
                  <View style={styles.exerciseIcon}>
                    <Dumbbell size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseMeta}>
                      {EXERCISE_CATEGORY_LABELS[exercise.category]}
                      {exercise.muscleGroups?.length > 0
                        ? ` · ${exercise.muscleGroups.join(", ")}`
                        : ""}
                      {exercise.equipment ? ` · ${exercise.equipment}` : ""}
                    </Text>
                    <View style={styles.mediaLinks}>
                      {exercise.videoUrl && (
                        <TouchableOpacity
                          onPress={() => Linking.openURL(exercise.videoUrl!)}
                          style={styles.mediaLink}
                        >
                          <Play size={14} color={theme.colors.primary} />
                          <Text style={styles.mediaLinkText}>Video</Text>
                        </TouchableOpacity>
                      )}
                      {exercise.imageUrl && (
                        <TouchableOpacity
                          onPress={() => Linking.openURL(exercise.imageUrl!)}
                          style={styles.mediaLink}
                        >
                          <Image size={14} color={theme.colors.primary} />
                          <Text style={styles.mediaLinkText}>Foto</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </BaseCard>
            </TouchableOpacity>
          ))}

        <TouchableOpacity onPress={handleCustomExercise} activeOpacity={0.7}>
          <View style={styles.customRow}>
            <Plus size={20} color={theme.colors.primary} />
            <Text style={styles.customText}>Crear ejercicio personalizado</Text>
          </View>
        </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    height: 52,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    marginLeft: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  categoriesRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body.fontSize,
  },
  exerciseCard: {
    padding: theme.spacing.lg,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  exerciseIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseInfo: {
    flex: 1,
    gap: theme.spacing.xxs,
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: "600",
  },
  exerciseMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  mediaLinks: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: theme.spacing.xxs,
  },
  mediaLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xxs,
  },
  mediaLinkText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: "600",
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  customText: {
    color: theme.colors.primary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: "600",
  },
});
