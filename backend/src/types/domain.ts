export type ProjectStatus = 'Activo' | 'En planificación' | 'En convocatoria' | 'Cerrado';

export type ProjectSummary = {
  id: number;
  institutionId: number;
  institutionName: string;
  institutionSigla: string;
  titulo: string;
  ubicacion: string;
  estado: ProjectStatus;
  status?: 'Activo' | 'En progreso' | 'Cerrado';
  estadoLista?: 'Activo' | 'En progreso' | 'Cerrado';
  carreras: string[];
  descripcion: string;
  resumen: string | null;
  fechaInicio: string | null;
  fechaCierre: string | null;
  cupos: number | null;
  cuposOcupados?: number;
  cuposTotales?: number | null;
  cuposTexto?: string;
  image: string | null;
  equipo: string[];
  personas: number;
};

export type InstitutionSummary = {
  id: number;
  nombre: string;
  sigla: string;
  ubicacion: string;
  tipo: string | null;
  image: string | null;
  descripcion: string;
  estadisticas: [string, string][];
  proyectos: ProjectSummary[];
};

export type StudentSummary = {
  id: string;
  nombre: string;
  carnet: string;
  carrera: string;
  genero: 'Masculino' | 'Femenino' | null;
  avatar: string | null;
  email: string | null;
};

export type MarkerSummary = {
  id: string;
  label: string;
  hombres: number;
  mujeres: number;
  lat: number;
  lng: number;
  projectId: number | null;
};