import Institution from '../../../../models/institution.model.js';
import ProjectEnrollment from '../../../../models/enrollment.model.js';
import Project from '../../../../models/project.model.js';
import type { ProjectStatus } from '../../../../types/domain.js';

type InstitutionProjectItem = {
  id: number;
  nombreInstitucion: string;
  nombreProyecto: string;
  estadoProyecto: 'Activo' | 'En progreso' | 'Cerrado';
  ubicacion: string;
};

function getProjectStatusLabel(estado: string): 'Activo' | 'En progreso' | 'Cerrado' {
  if (estado === 'Cerrado') return 'Cerrado';
  if (estado === 'Activo') return 'Activo';
  return 'En progreso';
}

function toInstitutionProjectItem(institutionName: string, project: any): InstitutionProjectItem {
  return {
    id: project.id,
    nombreInstitucion: institutionName,
    nombreProyecto: project.titulo,
    estadoProyecto: project.status ?? getProjectStatusLabel(project.estado),
    ubicacion: project.ubicacion,
  };
}

function parseStats(value: unknown): [string, string][] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (Array.isArray(item) && item.length >= 2 ? [String(item[0]), String(item[1])] : null))
    .filter((item): item is [string, string] => Boolean(item));
}

function toProjectDTO(project: any) {
  const enrollments = Array.isArray(project.enrollments) ? project.enrollments : [];
  const activeEnrollments = enrollments.filter((enrollment: any) => enrollment.activo !== false);
  return {
    id: project.id,
    institutionId: project.institution_id,
    institutionName: project.institution?.nombre ?? '',
    institutionSigla: project.institution?.sigla ?? '',
    titulo: project.titulo,
    ubicacion: project.ubicacion,
    estado: project.estado,
    carreras: project.carreras ?? [],
    descripcion: project.descripcion,
    resumen: project.resumen ?? null,
    fechaInicio: project.fecha_inicio ?? null,
    fechaCierre: project.fecha_cierre ?? null,
    cupos: project.cupos ?? null,
    image: project.image_url ?? null,
    equipo: project.team_members ?? [],
    personas: activeEnrollments.length > 0 ? activeEnrollments.length : (project.personas ?? 0),
    institution: project.institution?.nombre ?? project.institucion ?? '',
    estudiantesAsignados: activeEnrollments.length,
    status: getProjectStatusLabel(project.estado),
  };
}

function toInstitutionSummaryDTO(institution: any) {
  const plain = typeof institution.get === 'function' ? institution.get({ plain: true }) : institution;
  const allProjects = Array.isArray(plain.projects) ? plain.projects.map(toProjectDTO) : [];
  const activeProjects = allProjects.filter((project: any) => project.status === 'Activo');
  const inProgressProjects = allProjects.filter((project: any) => project.status === 'En progreso');
  const closedProjects = allProjects.filter((project: any) => project.status === 'Cerrado');
  const totalStudentsAssigned = allProjects.reduce((sum: number, project: any) => sum + Number(project.estudiantesAsignados ?? 0), 0);
  return {
    id: plain.id,
    nombre: plain.nombre,
    sigla: plain.sigla,
    ubicacion: plain.ubicacion,
    tipo: plain.tipo ?? null,
    image: plain.image_url ?? null,
    estadisticas: parseStats(plain.estadisticas),
    totalProyectosActivos: activeProjects.length,
    totalEstudiantesAsignados: totalStudentsAssigned,
  };
}

function toInstitutionDetailDTO(institution: any) {
  const plain = typeof institution.get === 'function' ? institution.get({ plain: true }) : institution;
  const allProjects = Array.isArray(plain.projects) ? plain.projects.map(toProjectDTO) : [];
  const activeProjects = allProjects.filter((project: any) => project.status === 'Activo');
  const inProgressProjects = allProjects.filter((project: any) => project.status === 'En progreso');
  const closedProjects = allProjects.filter((project: any) => project.status === 'Cerrado');
  const projectsGeneral = allProjects.map((project: any) => toInstitutionProjectItem(plain.nombre, project));
  const projectsActive = activeProjects.map((project: any) => toInstitutionProjectItem(plain.nombre, project));
  const projectsInProgress = inProgressProjects.map((project: any) => toInstitutionProjectItem(plain.nombre, project));
  const closedProjectsDTO = closedProjects.map((project: any) => toInstitutionProjectItem(plain.nombre, project));

  const totalStudentsAssigned = allProjects.reduce((sum: number, project: any) => sum + Number(project.estudiantesAsignados ?? 0), 0);
  const totalCarrerasAplicables = new Set<string>(allProjects.flatMap((project: any) => project.carreras ?? [])).size;

  return {
    id: plain.id,
    image: plain.image_url ?? null,
    tipo: plain.tipo ?? null,
    nombre: plain.nombre,
    ubicacion: plain.ubicacion,
    descripcion: plain.descripcion,
    totalProyectosActivos: activeProjects.length,
    totalEstudiantesAsignados: totalStudentsAssigned,
    totalCarrerasAplicables,
    proyectosGenerales: projectsGeneral,
    proyectosActivos: projectsActive,
    proyectosEnProgreso: projectsInProgress,
    proyectosCerrados: closedProjectsDTO,
  };
}

class InstitutionsService {
  public list = async () => {
    const institutions = await Institution.findAll({
      include: [
        {
          model: Project,
          as: 'projects',
          required: false,
          include: [
            { model: Institution, as: 'institution', attributes: ['id', 'nombre', 'sigla'] },
            {
              model: ProjectEnrollment,
              as: 'enrollments',
              required: false,
              attributes: ['id', 'activo'],
            },
          ],
        },
      ],
      order: [['nombre', 'ASC']],
    });

    return institutions.map(toInstitutionSummaryDTO);
  };

  public search = async (query?: string) => {
    const institutions = await this.list();
    const lowered = query?.trim().toLowerCase();
    if (!lowered) return institutions;

    return institutions.filter((institution) => {
      const haystack = [institution.nombre, institution.sigla, institution.ubicacion, institution.tipo ?? '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(lowered);
    });
  };

  public listForDirectory = async (filters: { search?: string; type?: string; sortBy?: 'nombre-asc' | 'nombre-desc' } = {}) => {
    const institutions = await this.search(filters.search);
    const normalizedType = filters.type?.trim().toLowerCase();
    const filtered = normalizedType && normalizedType !== 'todos'
      ? institutions.filter((institution) => (institution.tipo ?? '').trim().toLowerCase() === normalizedType)
      : institutions;

    return [...filtered].sort((a, b) => {
      if (filters.sortBy === 'nombre-desc') return b.nombre.localeCompare(a.nombre);
      return a.nombre.localeCompare(b.nombre);
    });
  };

  public getById = async (id: string) => {
    const institution = await Institution.findByPk(id, {
      include: [
        {
          model: Project,
          as: 'projects',
          required: false,
          include: [
            { model: Institution, as: 'institution', attributes: ['id', 'nombre', 'sigla'] },
            {
              model: ProjectEnrollment,
              as: 'enrollments',
              required: false,
              attributes: ['id', 'activo'],
            },
          ],
        },
      ],
    });

    return institution ? toInstitutionDetailDTO(institution) : null;
  };

  public update = async (id: string, body: {
    nombre?: string;
    ubicacion?: string;
    descripcion?: string;
    tipo?: string | null;
    image_url?: string | null;
  }) => {
    const institution = await Institution.findByPk(id);
    if (!institution) return null;

    const updatePayload: Partial<{
      nombre: string; sigla: string; ubicacion: string;
      descripcion: string; tipo: string | null; image_url: string | null;
    }> = {};

    if (typeof body.nombre      === 'string' && body.nombre.trim()) {
      updatePayload.nombre = body.nombre.trim();
      updatePayload.sigla  = body.nombre.trim()
        .split(/\s+/).map((w) => w[0]).filter(Boolean).join('').toUpperCase().slice(0, 8) || 'INST';
    }
    if (typeof body.ubicacion   === 'string') updatePayload.ubicacion   = body.ubicacion.trim();
    if (typeof body.descripcion === 'string') updatePayload.descripcion = body.descripcion.trim();
    if ('tipo'      in body) updatePayload.tipo      = body.tipo      ?? null;
    if ('image_url' in body) updatePayload.image_url = body.image_url ?? null;

    await institution.update(updatePayload);
    return this.getById(id);
  };

  public listInstitutions = async () => {
    return this.list();
  };

  public getInstitutionProjects = async (id: string, status?: ProjectStatus) => {
    const institution = await this.getById(id);
    if (!institution) return null;

    return {
      ...institution,
      activeProjects: institution.totalProyectosActivos,
      closedProjects: institution.proyectosCerrados.length,
    };
  };
}

export const institutionsService = new InstitutionsService();
export default InstitutionsService;