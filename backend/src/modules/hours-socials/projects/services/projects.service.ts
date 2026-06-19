import { col, fn, Transaction, where } from 'sequelize';
import sequelize from '../../../../core/config/database.js';
import Institution from '../../../../models/institution.model.js';
import Project from '../../../../models/project.model.js';
import ProjectEnrollment from '../../../../models/enrollment.model.js';
import Student from '../../../../models/student.model.js';
import MapMarker from '../../../../models/marker.model.js';
import { HttpError } from '../../../../utils/httpError.js';
import type { ProjectStatus } from '../../../../types/domain.js';
import { pool } from '../../../../core/config/pool.js';

const allowedStatuses: ProjectStatus[] = ['Activo', 'En planificación', 'En convocatoria', 'Cerrado'];

type ProjectListStatus = 'Activo' | 'En progreso' | 'Cerrado' | 'En planificación' | 'En convocatoria';

type StudentDraft = {
  nombre?: unknown;
  carnet?: unknown;
  carrera?: unknown;
  genero?: unknown;
  avatar?: unknown;
  email?: unknown;
};

type DetailObjective = {
  title: string;
  description: string;
};

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function deriveSigla(nombre: string) {
  const letters = nombre
    .split(/\s+/)
    .map((word) => word.trim()[0])
    .filter(Boolean)
    .join('')
    .toUpperCase();

  return (letters || 'INST').slice(0, 8);
}

async function resolveInstitution(body: Record<string, unknown>, transaction: Transaction) {
  const institutionIdValue = Number(body.institutionId);
  if (Number.isInteger(institutionIdValue) && institutionIdValue > 0) {
    const institution = await Institution.findByPk(institutionIdValue, { transaction });
    if (institution) return institution;
  }

  const institutionName = normalizeText(body.institutionName ?? body.institution);
  if (!institutionName) {
    throw new HttpError(400, 'Missing required fields: institutionName');
  }

  const institutionLocation = normalizeText(body.institutionLocation ?? body.ubicacion);
  const institutionDescription = normalizeText(body.institutionDescription ?? body.descripcion);
  const institutionImage = normalizeText(body.institutionImage ?? body.institutionImageUrl);
  const institutionType = normalizeText(body.institutionType ?? body.tipo);

  const existingInstitution = await Institution.findOne({
    where: where(fn('LOWER', col('nombre')), institutionName.toLowerCase()),
    transaction,
  });

  if (existingInstitution) {
    await existingInstitution.update(
      {
        ubicacion: institutionLocation || existingInstitution.ubicacion,
        descripcion: institutionDescription || existingInstitution.descripcion,
        image_url: institutionImage || existingInstitution.image_url,
        tipo: institutionType || existingInstitution.tipo,
      },
      { transaction }
    );

    return existingInstitution;
  }

  const createdInstitution = await Institution.create({
    nombre: institutionName,
    sigla: deriveSigla(institutionName),
    ubicacion: institutionLocation || 'Sin ubicación registrada',
    descripcion:
      institutionDescription || `Institución registrada para el proyecto ${normalizeText(body.titulo) || institutionName}`,
    tipo: institutionType || null,
    image_url: institutionImage || null,
  }, { transaction });

  return createdInstitution;
}

function collectStudents(body: Record<string, unknown>) {
  const rawStudents = Array.isArray(body.students)
    ? body.students
    : Array.isArray(body.equipo)
      ? body.equipo.map((name) => ({ nombre: name, carnet: '' }))
      : [];

  return rawStudents
    .map((student) => ({
      nombre: normalizeText((student as StudentDraft).nombre),
      carnet: normalizeText((student as StudentDraft).carnet),
      carrera: normalizeText((student as StudentDraft).carrera),
      genero:  normalizeText((student as StudentDraft).genero) || null,
      avatar: normalizeText((student as StudentDraft).avatar) || null,
      email: normalizeText((student as StudentDraft).email) || null,
    }))
    .filter((student) => Boolean(student.nombre && student.carnet));
}

function getProjectListStatus(estado: ProjectStatus): ProjectListStatus {
  if (estado === 'Cerrado') return 'Cerrado';
  if (estado === 'Activo') return 'Activo';
  return 'En progreso';
}

function mapVisibleStatusToProjectStatus(status: unknown): ProjectStatus | null {
  if (status === 'Activo') return 'Activo';
  if (status === 'En progreso') return 'En convocatoria';
  if (status === 'Cerrado') return 'Cerrado';
  if (status === 'En planificación') return 'En planificación';
  if (status === 'En convocatoria') return 'En convocatoria';
  return null;
}

function formatCapacity(personas: number, cupos: number | null) {
  if (cupos === null || Number.isNaN(cupos)) {
    return {
      cuposOcupados: personas,
      cuposTotales: null,
      cuposTexto: `${personas} ocupados`,
    };
  }

  return {
    cuposOcupados: personas,
    cuposTotales: cupos,
    cuposTexto: `${personas} de ${cupos}`,
  };
}

function buildKeyObjectives(description: string): DetailObjective[] {
  const normalized = description.trim().replace(/\s+/g, ' ');
  if (!normalized) return [];

  const sentences = normalized
    .split(/[.\n;]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const sourcePhrases = sentences.length > 0 ? sentences : [normalized];

  return sourcePhrases.slice(0, 4).map((sentence) => {
    const words = sentence.split(/\s+/).filter(Boolean);
    const title = words.slice(0, Math.min(6, words.length)).join(' ');

    return {
      title: title.length > 0 ? title : sentence.slice(0, 50),
      description: sentence,
    };
  });
}

function normalizeProjectStatus(status: ProjectStatus): 'Activo' | 'En progreso' | 'Cerrado' {
  if (status === 'Cerrado') return 'Cerrado';
  if (status === 'Activo') return 'Activo';
  return 'En progreso';
}

function countActiveEnrollmentsFromPlain(plain: any) {
  const enrollments = Array.isArray(plain.enrollments) ? plain.enrollments : [];
  if (enrollments.length === 0) {
    return null;
  }

  return enrollments.filter((enrollment: any) => enrollment?.activo !== false).length;
}

function sumMarkerValues(markers: Array<{ hombres?: number; mujeres?: number }>) {
  return markers.reduce<{ hombres: number; mujeres: number }>(
    (accumulator, marker) => ({
      hombres: accumulator.hombres + Number(marker.hombres ?? 0),
      mujeres: accumulator.mujeres + Number(marker.mujeres ?? 0),
    }),
    { hombres: 0, mujeres: 0 }
  );
}

function toProjectDetailDTO(
  project: any,
  enrollments: Array<{ nombre?: string; carnet?: string; carrera?: string; genero?: 'Masculino' | 'Femenino' | null; avatar?: string | null; email?: string | null }>
) {
  const plain = typeof project.get === 'function' ? project.get({ plain: true }) : project;
  const base = toProjectDTO(plain);
  // Contar género desde los enrollments reales, no desde map_markers estáticos
  const genderTotals = enrollments.reduce(
    (acc, e) => {
      if (e.genero === 'Masculino') acc.hombres += 1;
      else if (e.genero === 'Femenino') acc.mujeres += 1;
      return acc;
    },
    { hombres: 0, mujeres: 0 }
  );
  const activeEnrollments = enrollments.length;
  const cuposTotales = base.cuposTotales;
  const cuposOcupados = activeEnrollments;
  const cuposTexto = cuposTotales != null ? `${cuposOcupados} de ${cuposTotales}` : `${cuposOcupados} ocupados`;

  return {
    ...base,
    nombre: base.titulo,
    imagen: base.image,
    status: normalizeProjectStatus(plain.estado),
    estado: plain.estado,
    institution: base.institutionName,
    descripcion: base.descripcion,
    equipo: enrollments.map((student) => student.nombre ?? '').filter(Boolean),
    estudiantes: enrollments,
    estudiantesAsignados: activeEnrollments,
    cuposTexto,
    cuposOcupados,
    cuposTotales,
    carreras: base.carreras,
    hombres: genderTotals.hombres,
    mujeres: genderTotals.mujeres,
  };
}

function toProjectDTO(project: any) {
  const plain = typeof project.get === 'function' ? project.get({ plain: true }) : project;
  
  // Filtrar solo las inscripciones verdaderamente activas que traiga el modelo
  const enrollments = Array.isArray(plain.enrollments) 
    ? plain.enrollments.filter((e: any) => e?.activo !== false) 
    : [];
    
  const personas = enrollments.length ?? plain.personas ?? 0;
  const cupos = plain.cupos ?? null;
  const capacity = formatCapacity(personas, cupos);

  // Calcular el género real basado en los estudiantes incluidos
  const genderTotals = enrollments.reduce(
    (acc: { hombres: number; mujeres: number }, e: any) => {
      const genero = e.student?.genero;
      if (genero === 'Masculino') acc.hombres += 1;
      else if (genero === 'Femenino') acc.mujeres += 1;
      return acc;
    },
    { hombres: 0, mujeres: 0 }
  );

  return {
    id: plain.id,
    institutionId: plain.institution_id,
    institutionName: plain.institution?.nombre ?? '',
    institutionSigla: plain.institution?.sigla ?? '',
    titulo: plain.titulo,
    ubicacion: plain.ubicacion,
    estado: plain.estado,
    estadoLista: getProjectListStatus(plain.estado),
    status: getProjectListStatus(plain.estado),
    facultad: plain.facultad ?? 'General',
    carreras: plain.carreras ?? [],
    descripcion: plain.descripcion,
    resumen: plain.resumen ?? null,
    fechaInicio: plain.fecha_inicio ?? null,
    fechaCierre: plain.fecha_cierre ?? null,
    cupos,
    cuposOcupados: capacity.cuposOcupados,
    cuposTotales: capacity.cuposTotales,
    cuposTexto: capacity.cuposTexto,
    image: plain.image_url ?? null,
    equipo: plain.team_members ?? [],
    personas,
    institution: plain.institution?.nombre ?? plain.institutionName ?? '',
    // Enviamos los géneros reales calculados para las cards del listado
    hombres: genderTotals.hombres,
    mujeres: genderTotals.mujeres,
  };
}

function toProjectListDTO(project: any) {
  const payload = toProjectDTO(project);
  const { image, ...listPayload } = payload;
  return toProjectDTO(project);
}

/*function toProjectMapDTO(project: any) {
  const plain = typeof project.get === 'function' ? project.get({ plain: true }) : project;
  const markers = Array.isArray(plain.markers) ? plain.markers : [];
  const totals = sumMarkerValues(markers);

  return {
    id: plain.id,
    institution: plain.institution?.nombre ?? '',
    status: normalizeProjectStatus(plain.estado),
    nombre: plain.titulo,
    ubicacion: plain.ubicacion,
    descripcion: plain.descripcion,
    hombres: totals.hombres,
    mujeres: totals.mujeres,
  };
}*/

class ProjectsService {
  public listProjects = async (filters: { search?: string; status?: string; institutionId?: string; location?: string; faculty?: string } = {}) => {
    const where: any = {};

    if (filters.institutionId) where.institution_id = filters.institutionId;

    const projects = await Project.findAll({
      where,
      include: [
        {
          model: Institution,
          as: 'institution',
          attributes: ['id', 'nombre', 'sigla'],
          required: true,
        },
        {
          model: ProjectEnrollment,
          as: 'enrollments',
          where: { activo: true }, // <--- Crucial: Solo inscripciones activas
          required: false,
          include: [
            {
              model: Student,
              as: 'student',
              required: true,
              attributes: ['id', 'genero', 'nombre'], // Traemos el género y nombre real
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const mapped = projects.map(toProjectListDTO);

    const search = filters.search?.trim();
    const loweredSearch = search?.toLowerCase();
    const loweredLocation = filters.location?.trim().toLowerCase();
    const normalizedStatus = filters.status?.trim().toLowerCase();
    const normalizedFaculty = filters.faculty?.trim().toLowerCase();

    return mapped.filter((project) => {
      const matchesSearch = !loweredSearch || project.titulo.toLowerCase().includes(loweredSearch);
      const matchesLocation = !loweredLocation || project.ubicacion.toLowerCase().includes(loweredLocation);
      const matchesStatus = !normalizedStatus || project.status.toLowerCase() === normalizedStatus;
      const matchesFaculty =
        !normalizedFaculty ||
        normalizedFaculty === 'todas las facultades' ||
        project.facultad.toLowerCase() === normalizedFaculty;

      return matchesSearch && matchesLocation && matchesStatus && matchesFaculty;
    });
  };

  public listProjectsForMap = async () => {
    // Traemos los proyectos incluyendo directamente sus estudiantes asignados activos
    const projects = await Project.findAll({
      include: [
        {
          model: Institution,
          as: 'institution',
          attributes: ['id', 'nombre', 'sigla'],
          required: true,
        },
        {
          model: ProjectEnrollment,
          as: 'enrollments',
          where: { activo: true }, // Solo inscripciones vigentes
          required: false,         // Permite proyectos vacíos en el mapa sin tumbar la consulta
          include: [
            {
              model: Student,
              as: 'student',
              required: true,
              attributes: ['genero'], // Solo nos interesa el género para contar
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // Mapeamos y contamos en memoria de forma segura y exacta
    return projects.map((project) => {
      const plain = typeof project.get === 'function' ? project.get({ plain: true }) : project;
      
      const enrollments = Array.isArray(plain.enrollments) ? plain.enrollments : [];
      
      // Contadores iniciales
      let hombres = 0;
      let mujeres = 0;

      // Iteramos sobre las inscripciones reales y activas del proyecto
      for (const enrollment of enrollments) {
        const genero = enrollment.student?.genero;
        if (genero === 'Masculino') {
          hombres++;
        } else if (genero === 'Femenino') {
          mujeres++;
        }
      }

      return {
        id: plain.id,
        institution: plain.institution?.nombre ?? '',
        status: normalizeProjectStatus(plain.estado),
        nombre: plain.titulo,
        ubicacion: plain.ubicacion,
        descripcion: plain.descripcion,
        hombres,
        mujeres,
      };
    });
  };

  public listDirectoryProjects = async (filters: {
    query?: string;
    faculty?: string;
    status?: ProjectStatus | 'Todos';
    location?: string;
    sortBy?: 'recentes' | 'titulo' | 'ubicacion';
  } = {}) => {
    const projects = await this.listProjects({ search: filters.query, status: filters.status === 'Todos' ? undefined : filters.status });
    const filtered = projects.filter((project) => {
      const matchesFaculty = !filters.faculty || filters.faculty === 'Todas las facultades' || project.carreras.length === 0
        ? true
        : project.carreras.some((career: string) => career.toLowerCase().includes(filters.faculty!.toLowerCase().split(' ')[0]));
      const matchesLocation = !filters.location || filters.location === 'Todas' || project.ubicacion.toLowerCase().includes(filters.location.toLowerCase());
      return matchesFaculty && matchesLocation;
    });

    return [...filtered].sort((a, b) => {
      if (filters.sortBy === 'titulo') return a.titulo.localeCompare(b.titulo);
      if (filters.sortBy === 'ubicacion') return a.ubicacion.localeCompare(b.ubicacion);
      return b.id.localeCompare(a.id);
    });
  };

  public getProjectById = async (id: string | number) => {
    const project = await Project.findByPk(id, {
      include: [
        { model: Institution, as: 'institution', attributes: ['id', 'nombre', 'sigla'], required: true },
        //{ model: MapMarker, as: 'markers', required: false, attributes: ['id', 'hombres', 'mujeres'] },
      ],
    });

    if (!project) return null;

    const enrollments = await this.listEnrollmentsByProjectId(id);
    return toProjectDetailDTO(project, enrollments);
  };

  public getProjectDetail = async (id: string) => {
    const project = await Project.findByPk(id, {
      include: [
        { model: Institution, as: 'institution', attributes: ['id', 'nombre', 'sigla'], required: true },
        { model: MapMarker, as: 'markers', required: false, attributes: ['id', 'hombres', 'mujeres'] },
      ],
    });

    if (!project) return null;

    const enrollments = await this.listEnrollmentsByProjectId(id);
    const detail = toProjectDetailDTO(project, enrollments);

    return {
      ...detail,
      resumen: detail.resumen ?? detail.descripcion,
      fechas: [detail.fechaInicio, detail.fechaCierre].filter(Boolean).join(' - ') || null,
      desplegados: `${detail.estudiantesAsignados ?? detail.personas} estudiantes asignados`,
    };
  };

  public listEnrollmentsByProjectId = async (projectId: string | number) => {
    const enrollments = await ProjectEnrollment.findAll({
      where: { project_id: projectId },
      include: [{ model: Student, as: 'student', required: true }],
      order: [['created_at', 'DESC']],
    });

    return enrollments.map((enrollment) => ({
      id: enrollment.id,
      project_id: enrollment.project_id,
      student_id: enrollment.student_id,
      cargo: enrollment.cargo,
      activo: enrollment.activo,
      created_at: enrollment.created_at,
      nombre: (enrollment.get('student') as any)?.nombre,
      carnet: (enrollment.get('student') as any)?.carnet,
      carrera: (enrollment.get('student') as any)?.carrera,
      genero: (enrollment.get('student') as any)?.genero,
      avatar: (enrollment.get('student') as any)?.avatar,
      email: (enrollment.get('student') as any)?.email,
    }));
  };

  public listProjectStudents = async (projectId: string | number) => {
    const enrollments = await this.listEnrollmentsByProjectId(projectId);
    return enrollments.map((enrollment) => ({
      nombre: enrollment.nombre,
      carrera: enrollment.carrera,
      cargo: enrollment.cargo,
      avatar: enrollment.avatar ?? enrollment.nombre?.split(' ').map((word: string) => word[0]).join('').substring(0, 2).toUpperCase(),
    }));
  };

  public getProjectEnrollmentStats = async (projectId: string | number) => {
    const [project, enrollments] = await Promise.all([
      this.getProjectById(projectId),
      this.listEnrollmentsByProjectId(projectId),
    ]);

    if (!project) return null;

    return {
      ...project,
      estudiantesAsignados: enrollments.length,
      cuposOcupados: enrollments.length,
      cuposTexto: project.cuposTotales != null ? `${enrollments.length} de ${project.cuposTotales}` : `${enrollments.length} ocupados`,
    };
  };

  public createProject = async (body: Record<string, unknown>) => {
    const statusCandidate = normalizeText(body.estado) || 'Activo';
    const estado = allowedStatuses.includes(statusCandidate as ProjectStatus) ? (statusCandidate as ProjectStatus) : 'Activo';
    const cuposValue = Number(body.cupos);
    const faculty = normalizeText(body.facultad);
    const careers = Array.isArray(body.carreras)
      ? body.carreras.map((career) => normalizeText(career)).filter(Boolean)
      : normalizeText(body.carrera)
        ? [normalizeText(body.carrera)]
        : [];
    const students = collectStudents(body);

    if (!faculty) {
      throw new HttpError(400, 'Missing required fields: facultad');
    }

    if (careers.length === 0) {
      throw new HttpError(400, 'Missing required fields: carreras');
    }

    if (students.length === 0) {
      throw new HttpError(400, 'Missing required fields: students');
    }

    const transaction = await sequelize.transaction();
    try {
      const institution = await resolveInstitution(body, transaction);

      const project = await Project.create(
        {
          institution_id: institution.id,
          titulo: normalizeText(body.titulo),
          ubicacion: normalizeText(body.ubicacion),
          estado,
          facultad: faculty,
          carreras: careers,
          descripcion: normalizeText(body.descripcion),
          resumen: normalizeText(body.resumen) || null,
          fecha_inicio: normalizeText(body.fechaInicio) || null,
          fecha_cierre: normalizeText(body.fechaCierre) || null,
          cupos: Number.isFinite(cuposValue) ? cuposValue : null,
          image_url: normalizeText(body.image) || null,
          team_members: students.map((student) => student.nombre),
          personas: students.length,
        },
        { transaction }
      );

      for (const studentDraft of students) {
        const [student] = await Student.upsert(
          {
            nombre: studentDraft.nombre,
            carnet: studentDraft.carnet,
            carrera: studentDraft.carrera || careers[0] || '',
            genero:  (studentDraft.genero as 'Masculino' | 'Femenino') || null,
            avatar: studentDraft.avatar,
            email: studentDraft.email,
          },
          { transaction, returning: true }
        );

        await ProjectEnrollment.upsert(
          {
            project_id: project.id,
            student_id: student.id,
            cargo: 'Estudiante',
            activo: true,
          },
          { transaction, returning: true }
        );
      }

      await transaction.commit();
      return this.getProjectById(project.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  public enrollStudent = async (projectId: string | number, body: Record<string, unknown>) => {
    const project = await this.getProjectById(projectId);
    if (!project) return null;

    const numericProjectId = Number(projectId);
    if (!Number.isInteger(numericProjectId)) {
      throw new HttpError(400, 'Invalid project id');
    }

    const transaction = await sequelize.transaction();
    try {
      const [student] = await Student.upsert(
        {
          nombre: String(body.nombre),
          carnet: String(body.carnet),
          carrera: String(body.carrera),
          genero:  (body.genero === 'Masculino' || body.genero === 'Femenino') ? body.genero : null,
          avatar: typeof body.avatar === 'string' ? body.avatar : null,
          email: typeof body.email === 'string' ? body.email : null,
        },
        { transaction, returning: true }
      );

      const [enrollment] = await ProjectEnrollment.upsert(
        {
          project_id: numericProjectId,
          student_id: student.id,
          cargo: typeof body.cargo === 'string' ? body.cargo : 'Estudiante',
          activo: typeof body.activo === 'boolean' ? body.activo : true,
        },
        { transaction, returning: true }
      );

      // Recalcular el estado del proyecto para que la barra de cupos cambie al instante.
      // personas = cantidad de inscripciones activas; team_members = lista de nombres activos.
      const activeEnrollments = await ProjectEnrollment.findAll({
        where: { project_id: numericProjectId, activo: true },
        include: [{ model: Student, as: 'student', required: true }],
        transaction,
      });

      const activeNames = activeEnrollments
        .map((item) => (item.get('student') as any)?.nombre)
        .filter(Boolean)
        .map((name) => String(name));

      await Project.update(
        {
          personas: activeEnrollments.length,
          team_members: activeNames,
        },
        {
          where: { id: numericProjectId },
          transaction,
        }
      );

      await transaction.commit();

      // return updated project detail so callers can refresh UI easily
      const updated = await this.getProjectById(numericProjectId);
      return { project: updated, student, enrollment };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  public updateProject = async (projectId: string | number, body: Record<string, unknown>) => {
    const projectModel = await Project.findByPk(projectId, { include: [{ model: Institution, as: 'institution' }] });
    if (!projectModel) throw new HttpError(404, 'Project not found');

    const transaction = await sequelize.transaction();
    try {
      const statusCandidate = mapVisibleStatusToProjectStatus(body.estado ?? body.status);

      // allow updating institution if provided
      if (body.institutionName) {
        await resolveInstitution(body, transaction);
      }

      await projectModel.update(
        {
          titulo: normalizeText(body.titulo) || projectModel.titulo,
          ubicacion: normalizeText(body.ubicacion) || projectModel.ubicacion,
          descripcion: normalizeText(body.descripcion) || projectModel.descripcion,
          resumen: normalizeText(body.resumen) || projectModel.resumen,
          fecha_inicio: normalizeText(body.fechaInicio) || projectModel.fecha_inicio,
          fecha_cierre: normalizeText(body.fechaCierre) || projectModel.fecha_cierre,
          cupos: typeof body.cupos !== 'undefined' ? Number(body.cupos) : projectModel.cupos,
          estado: statusCandidate ?? projectModel.estado,
          image_url: normalizeText(body.projectImage ?? body.image ?? body.imageUrl ?? body.imagen) || projectModel.image_url,
          facultad: normalizeText(body.facultad) || projectModel.facultad,
          carreras: Array.isArray(body.carreras) ? body.carreras : projectModel.carreras,
        },
        { transaction }
      );

      await transaction.commit();
      return this.getProjectById(projectId);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  };

  public listMapMarkers = async () => {
    const markers = await MapMarker.findAll({ order: [['label', 'ASC']] });
    return markers.map((marker) => ({
      id: marker.id,
      label: marker.label,
      hombres: marker.hombres,
      mujeres: marker.mujeres,
      lat: Number(marker.lat),
      lng: Number(marker.lng),
      projectId: marker.project_id ?? null,
    }));
  };

  public listStudentDirectory = async () => {
    const projects = await this.listProjects();
    return projects.map((project) => ({
      titulo: project.titulo,
      facultad: project.facultad ?? 'General',
      ubicacion: project.ubicacion.split(',')[0] ?? project.ubicacion,
      estudiantes: [],
    }));
  };

  public getDashboardSummary = async () => {
    const [totalInstitutions, totalProjects, totalActiveEnrollments, totalMarkers] = await Promise.all([
      Institution.count(),
      Project.count(),
      ProjectEnrollment.count({ where: { activo: true } }),
      MapMarker.count(),
    ]);

    const projectsByStatus = await Project.findAll({
      attributes: ['estado', [sequelize.fn('COUNT', sequelize.col('estado')), 'total']],
      group: ['estado'],
      raw: true,
    });

    return {
      totalInstitutions,
      totalProjects,
      totalActiveEnrollments,
      totalMarkers,
      projectsByStatus,
    };
  };
}

export const projectsService = new ProjectsService();
export default ProjectsService;