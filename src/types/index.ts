export type EstadoProyecto = 'Activo' | 'En progreso' | 'En planificación' | 'En convocatoria' | 'Cerrado';

export type Proyecto = {
  id: string;
  institucion: string;
  institucionNombre?: string;
  titulo: string;
  ubicacion: string;
  estado: EstadoProyecto;
  status?: 'Activo' | 'En progreso' | 'Cerrado';
  facultad?: string;
  carreras: string[];
  fechaLimite?: string;
  cupos?: string;
  cuposOcupados?: number;
  cuposTotales?: number | null;
  cuposTexto?: string;
  imagen?: string;
  descripcion: string;
  equipo: string[];
};

export type Institucion = {
  id: string;
  nombre: string;
  sigla: string;
  ubicacion: string;
  tipo?: string;
  image?: string;
  descripcion: string;
  estadisticas: [string, string][];
  proyectos: Proyecto[];
};

export type Estudiante = {
  nombre: string;
  cargo?: string;
  carrera: string;
  avatar: string;
  carnet?: string;   
  email?: string;    
};

export type ProyectoMapa = Proyecto & {
  resumen: string;
  personas: number;
};

export type MarcadorMapa = {
  label: string;
  hombres: number;
  mujeres: number;
  // Replaced screen-position percentages with geographic coordinates
  // (latitude / longitude) so markers can be anchored to the map.
  lat: number;
  lng: number;
  id: string;
};

export type ProyectoEstudiante = {
  id: string;
  titulo: string;
  facultad: string;
  ubicacion: string;
  estudiantes: Estudiante[];
};

export type MiembroEquipo = {
  nombre: string;
  cargo: string;
  carrera: string;
  activo: boolean;
};
