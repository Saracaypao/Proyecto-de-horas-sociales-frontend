import Student from '../../../../models/student.model.js';
import { projectsService } from '../../projects/services/projects.service.js';
import { pool } from '../../../../core/config/pool.js';

class StudentsService {
  public list = async () => {
    const students = await Student.findAll({ order: [['nombre', 'ASC']] });
    return students.map((student) => ({
      id: student.id,
      nombre: student.nombre,
      carnet: student.carnet,
      carrera: student.carrera,
      genero:  student.genero ?? null,
      avatar: student.avatar ?? null,
      email: student.email ?? null,
    }));
  };

  public search = async (query?: string) => {
    const students = await this.list();
    const lowered = query?.trim().toLowerCase();
    if (!lowered) return students;

    return students.filter((student) => {
      const haystack = [student.nombre, student.carnet, student.carrera, student.email ?? ''].join(' ').toLowerCase();
      return haystack.includes(lowered);
    });
  };

  public listByProject = async (projectId: string) => projectsService.listProjectStudents(projectId);

  public listDirectory = async (filters: { search?: string; faculty?: string; location?: string } = {}) => {
    const projects = await projectsService.listProjects({
      faculty: filters.faculty,
      location: filters.location,
    });

    const details = await Promise.all(
      projects.map(async (project) => {
        const detail = await projectsService.getProjectById(project.id);
        const mapped = (detail?.estudiantes ?? []).map((student) => ({
          nombre: student.nombre,
          carnet: student.carnet,
          carrera: student.carrera,
          cargo: 'Estudiante',
          genero: student.genero ?? null,
          avatar: student.avatar ?? null,
          email: student.email ?? null,
        }));

        return {
          projectId: project.id,
          nombreProyecto: project.titulo,
          ubicacionProyecto: project.ubicacion,
          facultad: project.facultad,
          miembrosEquipo: Number(detail?.estudiantesAsignados ?? project.personas ?? mapped.length),
          equipoPreview: mapped.slice(0, 3),
        };
      })
    );

    const loweredSearch = filters.search?.trim().toLowerCase();
    if (!loweredSearch) return details;

    return details.filter((entry) => {
      const haystack = [
        entry.nombreProyecto,
        entry.ubicacionProyecto,
        entry.facultad,
        ...(entry.equipoPreview ?? []).map((student) => `${student.nombre} ${student.carnet} ${student.carrera} ${student.email ?? ''}`),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(loweredSearch);
    });
  };

  public create = async (body: Record<string, unknown>) => {
    const [student] = await Student.upsert(
      {
        nombre: String(body.nombre),
        carnet: String(body.carnet),
        carrera: String(body.carrera),
        genero:  (body.genero === 'Masculino' || body.genero === 'Femenino') ? body.genero : null,
        avatar: typeof body.avatar === 'string' ? body.avatar : null,
        email: typeof body.email === 'string' ? body.email : null,
      },
      { returning: true }
    );

    return {
      id: student.id,
      nombre: student.nombre,
      carnet: student.carnet,
      carrera: student.carrera,
      genero:  student.genero ?? null,
      avatar: student.avatar ?? null,
      email: student.email ?? null,
    };
  };

public getGenderByMunicipio = async () => {
    const sql = `
      SELECT
        COALESCE(
          NULLIF(TRIM(SPLIT_PART(p.ubicacion, ',', 2)), ''),
          NULLIF(TRIM(SPLIT_PART(p.ubicacion, ',', 1)), ''),
          'Sin municipio'
        ) AS municipio,
        COALESCE(COUNT(*) FILTER (WHERE s.genero = 'Masculino'), 0) AS hombres,
        COALESCE(COUNT(*) FILTER (WHERE s.genero = 'Femenino'), 0) AS mujeres
      FROM project_enrollments e
      JOIN students s ON s.id = e.student_id
      JOIN projects p ON p.id = e.project_id
      WHERE e.activo = true
      GROUP BY municipio
      ORDER BY municipio ASC;
    `;

    const result = await pool.query(sql);
    const rows = result.rows || [];

    return rows.map((r: any) => ({
      municipio: String(r.municipio || 'Sin municipio'),
      hombres: Number(r.hombres ?? 0),
      mujeres: Number(r.mujeres ?? 0),
    }));
  };

}

export const studentsService = new StudentsService();
export default StudentsService;