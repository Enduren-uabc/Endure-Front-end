import type {
  ClientProfileViewModel,
  ProfileAction,
  TrainerApplicationCard,
  TrainerApplicationCardStatus,
  TrainerProfessionalProfile,
} from '../types/profile';

export const clientProfileDefaults: Pick<ClientProfileViewModel, 'bio' | 'metrics'> = {
  bio: 'Entreno fuerza cuatro dias por semana y estoy construyendo constancia sin complicarlo.',
  metrics: [
    { id: 'workouts', label: 'Entrenos', value: '42', helper: 'Completados' },
    { id: 'streak', label: 'Mejor racha', value: '14d', helper: 'Historica' },
    { id: 'weight', label: 'Peso', value: '78.4 kg', helper: 'Actual' },
  ],
};

export const clientProfileActions: ProfileAction[] = [
  {
    key: 'routines',
    label: 'Mis rutinas',
    description: 'Planes creados, sugeridos y asignados.',
  },
  {
    key: 'history',
    label: 'Historial de entrenamientos',
    description: 'Sesiones, volumen y detalle reciente.',
  },
  {
    key: 'achievements',
    label: 'Logros y PRs',
    description: 'Records personales y metas alcanzadas.',
  },
  {
    key: 'measurements',
    label: 'Mediciones',
    description: 'Peso y datos corporales registrados.',
  },
  {
    key: 'settings',
    label: 'Configuracion',
    description: 'Recordatorios, privacidad y cuenta.',
  },
  {
    key: 'help',
    label: 'Ayuda y soporte',
    description: 'Preguntas frecuentes y contacto.',
  },
  {
    key: 'logout',
    label: 'Cerrar sesion',
    description: 'Salir de esta cuenta en el dispositivo.',
    tone: 'danger',
  },
];

const trainerStatusCopy: Record<TrainerApplicationCardStatus, TrainerApplicationCard> = {
  not_applied: {
    status: 'not_applied',
    title: 'Aplica como entrenador',
    description: 'Verifica tu formacion y empieza a gestionar clientes en Endure.',
    actionLabel: 'Aplicar',
  },
  in_review: {
    status: 'in_review',
    title: 'Solicitud en revision',
    description: 'Te avisaremos en cuanto haya una decision.',
  },
  approved: {
    status: 'approved',
    title: 'Solicitud aprobada',
    description: 'Tu perfil profesional esta listo para gestionar clientes.',
    actionLabel: 'Ir al panel',
  },
  rejected: {
    status: 'rejected',
    title: 'Solicitud no aprobada',
    description: 'Puedes corregir tu informacion y volver a enviar la solicitud.',
    actionLabel: 'Aplicar de nuevo',
  },
};

export function buildTrainerApplicationCard(
  status: TrainerApplicationCardStatus,
  rejectionReason?: string,
): TrainerApplicationCard {
  return {
    ...trainerStatusCopy[status],
    rejectionReason,
  };
}

export const trainerProfileDefaults: Omit<
  TrainerProfessionalProfile,
  'displayName' | 'email' | 'handle' | 'avatarUrl' | 'avatarInitials'
> = {
  specialty: 'Fuerza e hipertrofia',
  yearsOfExperience: '5 anos',
  bio: 'Entrenador enfocado en tecnica, progresion sostenible y adherencia semanal.',
  certifications: [
    'Certificacion en entrenamiento de fuerza',
    'Primeros auxilios deportivos',
    'Especialidad en recomposicion corporal',
  ],
  metrics: [
    { id: 'clients', label: 'Clientes', value: '18', helper: 'Activos' },
    { id: 'assigned', label: 'Rutinas', value: '7', helper: 'Esta semana' },
    { id: 'adherence', label: 'Adherencia', value: '84%', helper: 'Promedio' },
  ],
};
