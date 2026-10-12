import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { TrainerDrawerParamList, TrainerTabsParamList } from '@/features/trainer/types/trainer-navigation.types';
import { useHomeData } from '../hooks/use-home-data';
import { getWorkoutAction } from '../home-state';
import type { HomeWorkoutAction } from '../types/home';
import { theme } from '@/theme';

type HomeData = ReturnType<typeof useHomeData>;
type HomeNavigation = BottomTabNavigationProp<TrainerTabsParamList, 'Home'>;
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function HomeButton({ label, onPress, primary = false }: {
  label: string; onPress: () => void; primary?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.button, primary && styles.primaryButton,
        pressed && styles.pressedButton, focused && styles.focusedButton,
      ]}
    >
      <Text style={[styles.buttonText, primary && styles.primaryButtonText]}>{label}</Text>
    </Pressable>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <View style={styles.loading} accessibilityLiveRegion="polite">
      <ActivityIndicator color={theme.colors.primary} accessibilityLabel="Cargando" />
      <Text style={styles.body}>{label}</Text>
    </View>
  );
}

function Recovery({ message, label, onRetry }: {
  message: string; label: string; onRetry: () => void;
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.notice} accessibilityLiveRegion="polite">{message}</Text>
      <HomeButton label={label} onPress={onRetry} />
    </View>
  );
}

function WorkoutPanel({ home, navigation, secondary = false }: {
  home: HomeData; navigation: HomeNavigation; secondary?: boolean;
}) {
  const action = getWorkoutAction(home.session, home.routines, home.now);
  const retry = () => { void home.session.refetch(); void home.routines.refetch(); };
  const routines = () => navigation.navigate('Routines', { screen: 'RoutinesList' });
  const workout = () => navigation.navigate('Workout', { screen: 'WorkoutStart' });
  const content = getWorkoutCopy(action);
  const hasError = home.session.isError || home.routines.isError;
  const refreshing = home.session.isFetching || home.routines.isFetching;
  return (
    <View style={styles.panel}>
      <Text style={styles.eyebrow}>{secondary ? 'TU ENTRENAMIENTO' : 'HOY'}</Text>
      {action.kind === 'loading' ? <Loading label="Buscando tu entrenamiento…" /> : (
        <>
          <Text accessibilityRole="header" style={secondary ? styles.sectionTitle : styles.actionTitle}>
            {content.title}
          </Text>
          <Text style={styles.body}>{content.description}</Text>
          {action.kind === 'error' ? (
            <HomeButton label="Reintentar entrenamiento" onPress={retry} primary={!secondary} />
          ) : (
            <HomeButton
              label={content.button}
              primary={!secondary}
              onPress={action.kind === 'resume'
                ? () => navigation.navigate('Workout', {
                  screen: 'WorkoutSession', params: { sessionId: action.session.id },
                })
                : action.kind === 'ready' ? workout : routines}
            />
          )}
          {action.kind === 'incomplete' && (
            <HomeButton label="Actualizar entrenamiento" onPress={retry} />
          )}
          {hasError && action.kind !== 'error' && (
            <Recovery
              message="No pudimos actualizar tu entrenamiento. Mostramos la última información disponible."
              label="Reintentar entrenamiento" onRetry={retry}
            />
          )}
          {!hasError && refreshing && <Text style={styles.meta} accessibilityLiveRegion="polite">Actualizando entrenamiento…</Text>}
        </>
      )}
    </View>
  );
}

function getWorkoutCopy(action: HomeWorkoutAction): { title: string; description: string; button: string } {
  switch (action.kind) {
    case 'resume': return {
      title: 'Continúa tu entrenamiento',
      description: 'Tienes una sesión en curso. Retoma donde la dejaste.', button: 'Continuar sesión',
    };
    case 'ready': return {
      title: action.routine.name,
      description: `${action.exerciseCount} ${action.exerciseCount === 1 ? 'ejercicio disponible' : 'ejercicios disponibles'} para hoy. Revisa tu entrenamiento antes de empezar.`,
      button: 'Ver entrenamiento de hoy',
    };
    case 'no-exercises': return {
      title: 'Hoy no hay ejercicios en tu rutina',
      description: `${action.routine.name} está activa. Revisa sus días y ejercicios en Rutinas.`, button: 'Revisar mi rutina',
    };
    case 'no-routine': return {
      title: 'Elige una rutina para empezar',
      description: 'Activa una de tus rutinas para ver aquí tu entrenamiento del día.', button: 'Ver mis rutinas',
    };
    case 'incomplete': return {
      title: 'Tu rutina tiene información incompleta',
      description: 'No podemos confirmar los ejercicios de hoy. Revisa tu rutina o actualiza la información.', button: 'Revisar mi rutina',
    };
    case 'error': return {
      title: 'No pudimos cargar tu entrenamiento',
      description: 'Vuelve a intentarlo para consultar tu sesión y tu rutina activa.', button: 'Reintentar entrenamiento',
    };
    case 'loading': return { title: '', description: '', button: '' };
  }
}

function TrainerPanel({ home, navigation }: { home: HomeData; navigation: HomeNavigation }) {
  const requests = home.requests;
  const total = requests.data;
  const openRequests = () => navigation.getParent<DrawerNavigationProp<TrainerDrawerParamList>>()
    ?.navigate('TrainerLinkStack', { screen: 'ReceivedRequests' });
  return (
    <View style={styles.group}>
      <View style={styles.panel}>
        <Text style={styles.eyebrow}>SOLICITUDES</Text>
        {total === undefined ? requests.isError ? (
          <>
            <Text accessibilityRole="header" style={styles.actionTitle}>No pudimos cargar tus solicitudes</Text>
            <Recovery message="Reintenta para conocer cuántas están pendientes."
              label="Reintentar solicitudes" onRetry={() => { void requests.refetch(); }} />
          </>
        ) : <Loading label="Consultando solicitudes pendientes…" /> : (
          <>
            <Text accessibilityRole="header" style={styles.actionTitle}>
              {total > 0 ? `${total} ${total === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}` : 'Tu bandeja está al día'}
            </Text>
            <Text style={styles.body}>
              {total > 0 ? 'Revisa las solicitudes de quienes quieren entrenar contigo.' : 'No tienes solicitudes pendientes. Puedes continuar con tus clientes.'}
            </Text>
            <HomeButton primary label={total > 0 ? 'Ver solicitudes recibidas' : 'Ver clientes'}
              onPress={total > 0 ? openRequests : () => navigation.navigate('Clients')} />
            {total === 0 && <HomeButton label="Ver solicitudes recibidas" onPress={openRequests} />}
            {requests.isError ? (
              <Recovery message="No pudimos actualizar las solicitudes. Mostramos el último total disponible."
                label="Reintentar solicitudes" onRetry={() => { void requests.refetch(); }} />
            ) : requests.isFetching && <Text style={styles.meta} accessibilityLiveRegion="polite">Actualizando solicitudes…</Text>}
          </>
        )}
      </View>
      <View style={styles.management}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>Gestiona tu trabajo</Text>
        <View style={styles.group}>
          <Text style={styles.body}>Consulta tus clientes y organiza tus rutinas.</Text>
          <HomeButton label="Clientes" onPress={() => navigation.navigate('Clients')} />
          <HomeButton label="Rutinas" onPress={() => navigation.navigate('Routines', { screen: 'RoutinesList' })} />
        </View>
      </View>
    </View>
  );
}

function WeeklyPanel({ home, navigation }: { home: HomeData; navigation: HomeNavigation }) {
  const query = home.weeklyStats;
  const stats = query.data;
  const incomplete = stats?.hasIncompleteData || stats?.hasIncompleteMinutes;
  return (
    <View style={styles.panel}>
      <View style={styles.group}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>Tu semana</Text>
        <Text style={styles.meta}>{home.week.label}</Text>
      </View>
      {!stats ? query.isError ? (
        <Recovery message="No pudimos cargar tu actividad semanal."
          label="Reintentar actividad" onRetry={() => { void query.refetch(); }} />
      ) : <Loading label="Cargando actividad semanal…" /> : (
        <>
          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{stats.completedWorkouts}</Text>
              <Text style={styles.body}>{stats.hasIncompleteData ? 'Entrenamientos registrados' : 'Entrenamientos'}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{stats.activeMinutes}</Text>
              <Text style={styles.body}>{incomplete ? 'Minutos registrados' : 'Minutos'}</Text>
            </View>
          </View>
          {incomplete && (
            <Recovery
              message="Hay información incompleta. Los valores muestran solo las sesiones y duraciones válidas; pueden faltar registros."
              label="Actualizar actividad" onRetry={() => { void query.refetch(); }}
            />
          )}
          <View style={styles.group}>
            <Text style={styles.body}>Actividad por día</Text>
            <View style={styles.days}>
              {WEEKDAYS.map((day, index) => (
                <View key={day} style={styles.day} accessible
                  accessibilityLabel={`${day}: ${stats.activeDays[index] ? 'entrenamiento registrado' : incomplete ? 'sin entrenamiento registrado; información incompleta' : 'sin entrenamiento terminado'}`}>
                  <Text style={styles.dayLabel}>{day}</Text>
                  <Text style={[styles.dayMark, stats.activeDays[index] && styles.activeDay]}>
                    {stats.activeDays[index] ? '✓' : '—'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          {stats.completedWorkouts === 0 && !incomplete && (
            <Text style={styles.body}>Aún no hay entrenamientos terminados esta semana.</Text>
          )}
          {query.isError ? (
            <Recovery message="No pudimos actualizar tu actividad. Mostramos la última información disponible."
              label="Reintentar actividad" onRetry={() => { void query.refetch(); }} />
          ) : query.isFetching && <Text style={styles.meta} accessibilityLiveRegion="polite">Actualizando actividad…</Text>}
        </>
      )}
      <HomeButton label="Ver historial" onPress={() => navigation.navigate('Workout', { screen: 'WorkoutHistory' })} />
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const home = useHomeData();
  const { width } = useWindowDimensions();
  const wide = width >= 960;
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.group}>
          <Text style={styles.eyebrow}>INICIO</Text>
          <Text accessibilityRole="header" style={styles.greeting}>Hola{home.name ? `, ${home.name}` : ''}</Text>
          <Text style={styles.body}>{home.dateLabel}</Text>
        </View>
        <View style={[styles.columns, wide && styles.wideColumns]}>
          <View style={[styles.mainColumn, wide && styles.wideMain]}>
            {home.isTrainer ? <TrainerPanel home={home} navigation={navigation} />
              : <WorkoutPanel home={home} navigation={navigation} />}
          </View>
          <View style={[styles.sideColumn, wide && styles.wideSide]}>
            {home.isTrainer && <WorkoutPanel home={home} navigation={navigation} secondary />}
            <WeeklyPanel home={home} navigation={navigation} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    width: '100%', maxWidth: 1100, alignSelf: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 24,
  },
  group: { gap: 12 },
  columns: { gap: 24 },
  wideColumns: { flexDirection: 'row', alignItems: 'flex-start' },
  mainColumn: { minWidth: 0 },
  sideColumn: { gap: 24, minWidth: 0 },
  wideMain: { flex: 1.8 },
  wideSide: { flex: 1 },
  panel: {
    backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.lg, padding: 16, gap: 12,
  },
  management: { gap: 12, marginTop: 12 },
  eyebrow: { color: theme.colors.primary, fontSize: 13, lineHeight: 18, fontWeight: '700', letterSpacing: 1 },
  greeting: { color: theme.colors.textPrimary, ...theme.typography.heading1 },
  actionTitle: { color: theme.colors.textPrimary, fontSize: 24, lineHeight: 30, fontWeight: '700' },
  sectionTitle: { color: theme.colors.textPrimary, ...theme.typography.heading3 },
  body: { color: theme.colors.textSecondary, ...theme.typography.body },
  meta: { color: theme.colors.textSecondary, ...theme.typography.small },
  notice: { color: theme.colors.textPrimary, ...theme.typography.body },
  loading: { gap: 12, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  button: {
    minHeight: 48, minWidth: 44, paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: theme.radius.md, borderWidth: 2, borderColor: theme.colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryButton: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  pressedButton: { opacity: 0.8 },
  focusedButton: { borderColor: theme.colors.textPrimary, borderStyle: 'dashed' },
  buttonText: { color: theme.colors.textPrimary, ...theme.typography.button, textAlign: 'center' },
  primaryButtonText: { color: theme.colors.background },
  metrics: { flexDirection: 'row', gap: 12 },
  metric: { flex: 1, minWidth: 0, gap: 8 },
  metricValue: { color: theme.colors.textPrimary, ...theme.typography.heading1 },
  days: { flexDirection: 'row', gap: 4 },
  day: { flex: 1, minWidth: 0, alignItems: 'center', gap: 8 },
  dayLabel: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18 },
  dayMark: { color: theme.colors.textSecondary, fontSize: 18, lineHeight: 26 },
  activeDay: { color: theme.colors.primary, fontWeight: '700' },
});
