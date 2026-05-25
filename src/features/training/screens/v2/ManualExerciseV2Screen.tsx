import React from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Plus, Trash2 } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import { TrainingV2Screen } from './TrainingV2Primitives';
import { useRoutineDetail } from '@/features/training/hooks/use-routines';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { DAY_OF_WEEK_LABELS, type DayOfWeek } from '@/features/training/types/routine';
import type { TrainingStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<TrainingStackParamList, 'ManualExercise'>;

interface SetEntry {
  id: string;
  reps: string;
  weight: string;
}

let setIdCounter = 0;
function newSetId() { return `set-${++setIdCounter}`; }

export default function ManualExerciseV2Screen({ navigation, route }: Props) {
  const { routineId, selectedDay: initialDay } = route.params;
  const { data: routine } = useRoutineDetail(routineId);
  const routineDays = routine?.days.map((d) => d.dayOfWeek) ?? [];

  const [name, setName] = React.useState('');
  const [selectedDays, setSelectedDays] = React.useState<DayOfWeek[]>(() =>
    initialDay && routineDays.includes(initialDay as DayOfWeek)
      ? [initialDay as DayOfWeek]
      : [],
  );
  const [sets, setSets] = React.useState<SetEntry[]>([
    { id: newSetId(), reps: '10', weight: '0' },
  ]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [dayPickerVisible, setDayPickerVisible] = React.useState(false);

  const handleAddSet = () => {
    if (sets.length >= 10) return;
    const last = sets[sets.length - 1];
    setSets((prev) => [...prev, { id: newSetId(), reps: last.reps, weight: last.weight }]);
  };

  const handleUpdateSet = (index: number, field: 'reps' | 'weight', value: string) => {
    setSets((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleRemoveSet = (index: number) => {
    if (sets.length <= 1) {
      Alert.alert('Última serie', 'Debes tener al menos 1 serie.');
      return;
    }
    setSets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!routine || !name.trim() || selectedDays.length === 0) return;
    setIsSaving(true);

    try {
      const parsedSets = sets.map((s, i) => ({
        setNumber: i + 1,
        reps: Number(s.reps) || 10,
        weight: Number(s.weight) || 0,
      }));

      for (const day of selectedDays) {
        const existingDay = routine.days.find((d) => d.dayOfWeek === day);
        const order = existingDay?.exercises.length ?? 0;

        const createdRes = await apiClient.post<{
          days?: Array<{ dayOfWeek: string; exercises: Array<{ id: string }> }>;
        }>(API_ENDPOINTS.routines.addExercise(routineId, day), {
          name: name.trim(),
          order,
        });

        const newExId = createdRes?.days
          ?.find((d) => d.dayOfWeek === day)
          ?.exercises?.find((e) => e.id)
          ?.id;

        if (newExId) {
          await apiClient.patch(
            API_ENDPOINTS.routines.configureExercise(routineId, day, newExId),
            { sets: parsedSets },
          );
        }
      }

      navigation.navigate('RoutineDetail', { id: routineId });
    } catch {
      Alert.alert('Error', 'No se pudo agregar el ejercicio.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TrainingV2Screen
      title="Agregar ejercicio manual"
      titleColor={theme.colors.textPrimary}
      subtitle={routine?.name}
      showDragIndicator
    >
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nombre del ejercicio"
        placeholderTextColor={theme.colors.textMuted}
        style={styles.nameInput}
        editable={!isSaving}
        maxLength={100}
      />

      <View style={styles.daySection}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayLabel}>Agregar a:</Text>
          <TouchableOpacity
            style={styles.addDayBtn}
            onPress={() => setDayPickerVisible(true)}
          >
            <Text style={styles.addDayBtnText}>+ Dia</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dayChips}>
          {selectedDays.map((day) => (
            <TouchableOpacity
              key={day}
              style={styles.chipActive}
              onPress={() =>
                setSelectedDays((prev) => prev.filter((d) => d !== day))
              }
            >
              <Text style={styles.chipTextActive}>{DAY_OF_WEEK_LABELS[day]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.setsLabel}>Series</Text>
      {sets.map((set, i) => (
        <View key={set.id} style={styles.setRow}>
          <Text style={styles.setNumber}>S{i + 1}</Text>
          <TextInput
            style={styles.setInput}
            value={set.reps}
            onChangeText={(v) => handleUpdateSet(i, 'reps', v)}
            keyboardType="numeric"
            placeholder="reps"
            placeholderTextColor={theme.colors.textDisabled}
          />
          <Text style={styles.setSign}>x</Text>
          <TextInput
            style={styles.setInput}
            value={set.weight}
            onChangeText={(v) => handleUpdateSet(i, 'weight', v)}
            keyboardType="numeric"
            placeholder="kg"
            placeholderTextColor={theme.colors.textDisabled}
          />
          {sets.length > 1 && (
            <TouchableOpacity onPress={() => handleRemoveSet(i)}>
              <Trash2 size={16} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      ))}
      {sets.length < 10 && (
        <TouchableOpacity style={styles.addSetBtn} onPress={handleAddSet}>
          <Plus size={16} color={theme.colors.primary} />
          <Text style={styles.addSetBtnText}>Agregar serie</Text>
        </TouchableOpacity>
      )}

      <View style={styles.footer}>
        <PrimaryButton
          label={isSaving ? 'Guardando...' : 'Guardar'}
          onPress={handleSave}
          loading={isSaving}
          disabled={!name.trim() || selectedDays.length === 0 || isSaving}
        />
        <SecondaryButton
          label="Cancelar"
          onPress={() => navigation.goBack()}
          disabled={isSaving}
        />
      </View>

      <Modal
        visible={dayPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDayPickerVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setDayPickerVisible(false)}
        >
          <Pressable style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Agregar a otro dia</Text>
            <View style={styles.pickerGrid}>
              {routineDays
                .filter((day) => !selectedDays.includes(day))
                .map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={styles.pickerChip}
                    onPress={() => {
                      setSelectedDays((prev) => [...prev, day]);
                      setDayPickerVisible(false);
                    }}
                  >
                    <Text style={styles.pickerChipText}>
                      {DAY_OF_WEEK_LABELS[day]}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
            {routineDays.filter((day) => !selectedDays.includes(day)).length ===
              0 && (
              <Text style={styles.pickerEmpty}>
                Todos los dias ya estan seleccionados.
              </Text>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({

  nameInput: {
    minHeight: 52,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  daySection: { gap: theme.spacing.sm },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayLabel: { color: theme.colors.textSecondary, fontSize: theme.typography.body.fontSize, lineHeight: theme.typography.body.lineHeight },
  addDayBtn: { minHeight: 36, paddingHorizontal: theme.spacing.md, borderRadius: theme.radius.full, borderWidth: 1, borderColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  addDayBtnText: { color: theme.colors.primary, fontSize: theme.typography.small.fontSize, fontWeight: '700' },
  dayChips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  chipActive: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.lg, borderRadius: theme.radius.full, backgroundColor: theme.colors.primary, borderWidth: 1, borderColor: theme.colors.primary },
  chipTextActive: { color: theme.colors.background, fontSize: theme.typography.body.fontSize, fontWeight: '600' },
  setsLabel: { color: theme.colors.textPrimary, fontSize: theme.typography.bodyStrong.fontSize, lineHeight: theme.typography.bodyStrong.lineHeight, fontWeight: theme.typography.bodyStrong.fontWeight },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  setNumber: { color: theme.colors.textMuted, fontSize: theme.typography.caption.fontSize, fontWeight: '700', width: 24 },
  setInput: { flex: 1, minHeight: 44, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceElevated, color: theme.colors.textPrimary, fontSize: theme.typography.bodyStrong.fontSize, fontWeight: '700', textAlign: 'center', paddingHorizontal: theme.spacing.sm },
  setSign: { color: theme.colors.textMuted, fontSize: theme.typography.bodyStrong.fontSize, fontWeight: '700' },
  addSetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm, minHeight: 44, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: theme.colors.primary, borderStyle: 'dashed', backgroundColor: `${theme.colors.primary}08` },
  addSetBtnText: { color: theme.colors.primary, fontSize: theme.typography.bodyStrong.fontSize, fontWeight: '700' },
  footer: { gap: theme.spacing.md, paddingTop: theme.spacing.md },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.overlay, padding: theme.spacing.xl },
  pickerCard: { width: '100%', maxWidth: 340, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg, gap: theme.spacing.md },
  pickerTitle: { color: theme.colors.textPrimary, fontSize: theme.typography.heading3.fontSize, lineHeight: theme.typography.heading3.lineHeight, fontWeight: theme.typography.heading3.fontWeight, textAlign: 'center' },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, justifyContent: 'center' },
  pickerChip: { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.xl, borderRadius: theme.radius.full, backgroundColor: theme.colors.surfaceElevated, borderWidth: 1, borderColor: theme.colors.border, minWidth: 80, alignItems: 'center' },
  pickerChipText: { color: theme.colors.textPrimary, fontSize: theme.typography.bodyStrong.fontSize, fontWeight: '700' },
  pickerEmpty: { color: theme.colors.textMuted, fontSize: theme.typography.body.fontSize, textAlign: 'center' },
});
