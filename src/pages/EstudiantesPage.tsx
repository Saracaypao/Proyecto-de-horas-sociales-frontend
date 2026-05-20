import { ArrowRight, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FilterGroup, PageHero, SearchPanel } from '../components/ui';
import { proyectosEstudiantes } from '../data/proyectos';

export default function EstudiantesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('Todas');
  const [locationFilter, setLocationFilter] = useState('Todas');

  const filteredProjects = proyectosEstudiantes.filter((project) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      [
        project.titulo,
        project.facultad,
        project.ubicacion,
        ...project.estudiantes.map((s) => `${s.nombre} ${s.carrera} ${s.cargo}`),
      ].some((v) => v.toLowerCase().includes(query));
    const matchesFaculty = facultyFilter === 'Todas' || project.facultad === facultyFilter;
    const matchesLocation = locationFilter === 'Todas' || project.ubicacion === locationFilter;
    return matchesQuery && matchesFaculty && matchesLocation;
  });

  return (
    <div className="students-page wide-page">
      <div className="students-topline">
        <span className="eyebrow-tag">Universidad Centroamericana (UCA)</span>
      </div>
      <PageHero
        title="Estudiantes por proyecto"
        description="Consulta qué estudiantes de la UCA participan en cada iniciativa activa y conoce sus equipos de trabajo."
      />

      <div className="content-split students-layout">
        <aside className="filter-rail">
          <SearchPanel
            title="Búsqueda"
            placeholder="Estudiante o proyecto..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
          <FilterGroup
            title="Filtrar por facultad"
            options={[
              'Todas',
              'Arquitectura e Ingeniería',
              'Ciencias sociales y humanidades',
              'Comunicación y mercadeo',
              'Derecho',
              'Diseño',
              'Educación',
              'Administración y Economía',
            ]}
            selected={facultyFilter}
            onChange={setFacultyFilter}
          />
          <FilterGroup
            title="Ubicación del proyecto"
            options={['Todas', 'San Salvador', 'Chalatenango', 'Santa Tecla', 'San Miguel']}
            selected={locationFilter}
            onChange={setLocationFilter}
          />
        </aside>

        <section className="list-panel project-team-feed">
          {filteredProjects.map((project) => (
            <article className="student-project-card" key={project.titulo}>
              <div className="student-project-header">
                <div>
                  <h3>{project.titulo}</h3>
                  <p className="muted with-icon">
                    <GraduationCap size={15} />
                    {project.facultad} <span className="dot">•</span> {project.ubicacion}
                  </p>
                </div>
                <Link
                  to={`/proyectos/${project.titulo.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-link"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  Ver Detalles del Proyecto
                  <ArrowRight size={18} />
                </Link>
              </div>

              <div className="team-label">MIEMBROS DEL EQUIPO ({project.estudiantes.length})</div>
              <div className="student-grid-horizontal">
                {project.estudiantes.map((student) => (
                  <div key={student.nombre} className="student-card-horizontal">
                    <div className="student-avatar">{student.avatar}</div>
                    <div className="student-info">
                      <h4>{student.nombre}</h4>
                      <p className="role-link">{student.cargo}</p>
                      <span className="muted small">{student.carrera}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}

          {/* Removed static "Cargar más proyectos" button */}
        </section>
      </div>
    </div>
  );
}
