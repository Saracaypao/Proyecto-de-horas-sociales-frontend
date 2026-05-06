export type EstadoProyecto = 'Activo' | 'En planificación' | 'En convocatoria' | 'Cerrado';

export type Proyecto = {
  id: string;
  institucion: string;
  titulo: string;
  ubicacion: string;
  estado: EstadoProyecto;
  carreras: string[];
  fechaLimite?: string;
  cupos?: string;
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
  cargo: string;
  carrera: string;
  avatar: string;
};

export type ProyectoMapa = Proyecto & {
  resumen: string;
  personas: number;
};

export type MarcadorMapa = {
  label: string;
  hombres: number;
  mujeres: number;
  top: number;
  left: number;
  id: string;
};

export type ProyectoEstudiante = {
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
