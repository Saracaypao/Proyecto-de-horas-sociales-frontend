import { pool } from '../core/config/pool.js';

export async function getDashboardSummary() {
  const [institutions, projects, enrollments, markers] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS total FROM institutions'),
    pool.query('SELECT COUNT(*)::int AS total FROM projects'),
    pool.query('SELECT COUNT(*)::int AS total FROM project_enrollments WHERE activo = TRUE'),
    pool.query('SELECT COUNT(*)::int AS total FROM map_markers'),
  ]);

  const statusBreakdownResult = await pool.query(
    `SELECT estado, COUNT(*)::int AS total
     FROM projects
     GROUP BY estado
     ORDER BY estado ASC`
  );

  return {
    totalInstitutions: institutions.rows[0]?.total ?? 0,
    totalProjects: projects.rows[0]?.total ?? 0,
    totalActiveEnrollments: enrollments.rows[0]?.total ?? 0,
    totalMarkers: markers.rows[0]?.total ?? 0,
    projectsByStatus: statusBreakdownResult.rows,
  };
}
