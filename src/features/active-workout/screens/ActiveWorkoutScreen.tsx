import React, { useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const mockWorkout = {
  id: 'workout-1',
  name: 'Día de Pecho y Tríceps',
  exercises: [
    {
      id: 'exercise-1',
      name: 'Press de Banca',
      sets: [
        { id: 'set-1-1', reps: 10, weight: 60, isCompleted: false },
        { id: 'set-1-2', reps: 8, weight: 70, isCompleted: false },
        { id: 'set-1-3', reps: 6, weight: 80, isCompleted: false },
      ],
    },
    {
      id: 'exercise-2',
      name: 'Fondos en paralelas',
      sets: [
        { id: 'set-2-1', reps: 12, weight: 0, isCompleted: false },
        { id: 'set-2-2', reps: 12, weight: 0, isCompleted: false },
        { id: 'set-2-3', reps: 12, weight: 0, isCompleted: false },
      ],
    },
  ],
};

const SetItem = ({ item, onToggle, onAddSet }) => {
  return (
    <View style={styles.setItem}>
      <TouchableOpacity onPress={() => onToggle(item.id)} style={styles.checkButton}>
        <View style={[styles.checkbox, item.isCompleted && styles.checked]}>
          {item.isCompleted && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>
      <Text style={styles.setText}>
        {item.reps} reps - {item.weight} kg
      </Text>
    </View>
  );
};

const ExerciseItem = ({ item, onToggleSet, onAddSet }) => {
  return (
    <View style={styles.exerciseCard}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      <FlatList
        data={item.sets}
        renderItem={({ item: setItem }) => <SetItem item={setItem} onToggle={onToggleSet} />}
        keyExtractor={(setItem) => setItem.id}
      />
      <Button title="Añadir Set" onPress={() => onAddSet(item.id)} />
    </View>
  );
};

export const ActiveWorkoutScreen = () => {
  const [workout, setWorkout] = useState(mockWorkout);

  const handleToggleSet = (setId) => {
    setWorkout((prevWorkout) => {
      const newExercises = prevWorkout.exercises.map((ex) => {
        const newSets = ex.sets.map((set) => {
          if (set.id === setId) {
            return { ...set, isCompleted: !set.isCompleted };
          }
          return set;
        });
        return { ...ex, sets: newSets };
      });
      return { ...prevWorkout, exercises: newExercises };
    });
  };

  const handleAddSet = (exerciseId) => {
    setWorkout((prevWorkout) => {
      const newExercises = prevWorkout.exercises.map((ex) => {
        if (ex.id === exerciseId) {
          const lastSet = ex.sets[ex.sets.length - 1] || { reps: 8, weight: 0 };
          const newSet = {
            id: `set-${exerciseId}-${ex.sets.length + 1}`,
            reps: lastSet.reps,
            weight: lastSet.weight,
            isCompleted: false,
          };
          return { ...ex, sets: [...ex.sets, newSet] };
        }
        return ex;
      });
      return { ...prevWorkout, exercises: newExercises };
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{workout.name}</Text>
      <FlatList
        data={workout.exercises}
        renderItem={({ item }) => (
          <ExerciseItem item={item} onToggleSet={handleToggleSet} onAddSet={handleAddSet} />
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
      <View style={styles.finishButtonContainer}>
        <Button title="Finalizar Entrenamiento" onPress={() => alert('Entrenamiento finalizado!')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 20, textAlign: 'center' },
  list: { marginBottom: 20 },
  exerciseCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  setItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkButton: {
    padding: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#38A169',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  checked: {
    backgroundColor: '#38A169',
  },
  checkMark: {
    color: 'white',
    fontWeight: 'bold',
  },
  setText: {
    color: 'white',
    fontSize: 16,
  },
  finishButtonContainer: {
    padding: 10,
  },
});
