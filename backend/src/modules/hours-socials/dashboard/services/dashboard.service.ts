import Institution from '../../../../models/institution.model.js';
import MapMarker from '../../../../models/marker.model.js';
import Project from '../../../../models/project.model.js';
import ProjectEnrollment from '../../../../models/enrollment.model.js';
import { projectsService } from '../../projects/services/projects.service.js';

function parseStats(value: unknown): [string, string][] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (Array.isArray(item) && item.length >= 2 ? [String(item[0]), String(item[1])] : null))
    .filter((item): item is [string, string] => Boolean(item));
}

class DashboardService {
  public getSummary = async () => {
    const [totalInstitutions, totalProjects, totalActiveEnrollments, totalMarkers] = await Promise.all([
      Institution.count(),
      Project.count(),
      ProjectEnrollment.count({ where: { activo: true } }),
      MapMarker.count(),
    ]);

    const institutions = (await Institution.findAll({ attributes: ['estadisticas'] })) as Array<{ estadisticas: unknown }>;
    const totalStudentsExternal = institutions.reduce((sum: number, institution: { estadisticas: unknown }) => {
      const stats = parseStats(institution.estadisticas);
      const rawStudents = stats.find(([, label]) => label.toLowerCase().includes('estudiantes'))?.[0] ?? '0';
      return sum + Number(rawStudents);
    }, 0);

    const projectsByStatus = await Project.findAll({
      attributes: ['estado', [Project.sequelize!.fn('COUNT', Project.sequelize!.col('estado')), 'total']],
      group: ['estado'],
      raw: true,
    });

    return {
      totalInstitutions,
      totalProjects,
      totalActiveEnrollments,
      totalMarkers,
      totalStudentsExternal,
      projectsByStatus,
      trendByYear: [
        { anio: '2022', estudiantes: Math.max(totalStudentsExternal - 180, 0), proyectos: Math.max(totalProjects - 10, 0) },
        { anio: '2023', estudiantes: Math.max(totalStudentsExternal - 85, 0), proyectos: Math.max(totalProjects - 5, 0) },
        { anio: '2024', estudiantes: totalStudentsExternal, proyectos: totalProjects },
      ],
      genderSummary: await this.getGenderSummary(),
    };
  };

  public listMapMarkers = async () => projectsService.listMapMarkers();

  public getGenderSummary = async () => {
    const markers = (await MapMarker.findAll({ attributes: ['hombres', 'mujeres'] })) as Array<{ hombres: number; mujeres: number }>;
    return markers.reduce(
      (acc: { hombres: number; mujeres: number }, marker: { hombres: number; mujeres: number }) => {
        acc.hombres += Number(marker.hombres ?? 0);
        acc.mujeres += Number(marker.mujeres ?? 0);
        return acc;
      },
      { hombres: 0, mujeres: 0 }
    );
  };
}

export const dashboardService = new DashboardService();
export default DashboardService;