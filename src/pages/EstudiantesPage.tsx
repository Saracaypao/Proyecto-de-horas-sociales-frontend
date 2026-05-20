import { ArrowRight, GraduationCap, Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FilterGroup } from '../components/ui';
import { proyectosEstudiantes } from '../data/proyectos';

export default function EstudiantesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('Todas las facultades');
  const [locationFilter, setLocationFilter] = useState('Todas');

  const facultyChips = [
    'Todas las facultades',
    'Arquitectura e Ingeniería',
    'Ciencias sociales y humanidades',
    'Comunicación y mercadeo',
    'Derecho',
    'Diseño',
    'Educación',
    'Administración y Economía',
  ];

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
    const matchesFaculty =
      facultyFilter === 'Todas' ||
      facultyFilter === 'Todas las facultades' ||
      project.facultad === facultyFilter;
    const matchesLocation = locationFilter === 'Todas' || project.ubicacion === locationFilter;
    return matchesQuery && matchesFaculty && matchesLocation;
  });

  return (
    <div className="students-page wide-page">
      {/* Removed eyebrow tag as requested */}
      <header className="page-hero">
        <div className="hero-left">
          <h1 className="main-title">Estudiantes por proyecto</h1>
        </div>
        <div className="hero-right">
          <div className="hero-search-card">
            <div className="search-wrapper">
                <Search size={18} className="search-icon-inside" />
                <input
                type="text"
                placeholder="Estudiante o proyecto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="chip-row">
        {facultyChips.map((chip) => (
          <button
            key={chip}
            className={chip === facultyFilter ? 'chip active' : 'chip'}
            type="button"
            onClick={() => setFacultyFilter(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="content-split students-layout">
        <aside className="filter-rail">
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
