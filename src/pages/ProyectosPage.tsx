import { ArrowRight, MapPinned, Plus } from 'lucide-react';
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import CreateProjectModal from '../components/CreateProjectModal';
import { ProjectListCard } from '../components/ProjectCards';
import { BackLink, FilterGroup, PageHero, SearchPanel } from '../components/ui';
import { instituciones } from '../data/instituciones';
import { clasificacionEstado, proyectosMapa } from '../data/proyectos';

// ─── ProyectosPage ────────────────────────────────────────────────────────────
export function ProyectosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const modalNuevo = searchParams.get('nuevo') === '1';
  const [selectedFaculty, setSelectedFaculty] = useState('Todas las facultades');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedLocation, setSelectedLocation] = useState('Todas');
  const [sortBy, setSortBy] = useState<'recentes' | 'titulo' | 'ubicacion'>('recentes');

  const facultyToMajors: Record<string, string[]> = {
    'Todas las facultades': [],
    'Arquitectura e Ingeniería': ['Ingeniería', 'Arquitectura', 'Electrónica'],
    'Ciencias sociales y humanidades': ['Sociología', 'Historia', 'Psicología'],
    'Comunicación y mercadeo': ['Mercadeo', 'Comunicación'],
    Derecho: ['Derecho'],
    Diseño: ['Diseño Gráfico', 'Diseño'],
    Educación: ['Educación'],
    Administración: ['Administración', 'Gestión'],
  };

  const allProjects = instituciones.flatMap((i) => i.proyectos);
  const filteredProjects = allProjects
    .filter((project) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        [project.titulo, project.institucion, project.ubicacion, project.descripcion, project.carreras.join(' ')].some(
          (v) => v.toLowerCase().includes(query)
        );
      const matchesFaculty =
        selectedFaculty === 'Todas las facultades' ||
        project.carreras.some((c) => facultyToMajors[selectedFaculty]?.includes(c));
      const matchesStatus = selectedStatus === 'Todos' || project.estado === selectedStatus;
      const matchesLocation =
        selectedLocation === 'Todas' || project.ubicacion.toLowerCase().includes(selectedLocation.toLowerCase());
      return matchesQuery && matchesFaculty && matchesStatus && matchesLocation;
    })
    .sort((a, b) => {
      if (sortBy === 'titulo') return a.titulo.localeCompare(b.titulo);
      if (sortBy === 'ubicacion') return a.ubicacion.localeCompare(b.ubicacion);
      return b.id.localeCompare(a.id);
    });

  return (
    <div className={`directory-page wide-page ${modalNuevo ? 'modal-open' : ''}`}>
      <PageHero
        title="Encuentra proyectos según tu carrera o colabora con otras áreas."
        description="Postúlate y participa en iniciativas de impacto social en todo El Salvador."
        action={
          <button className="primary-btn" type="button" onClick={() => setSearchParams({ nuevo: '1' })}>
            <Plus size={18} />
            <span>Crear nuevo proyecto</span>
          </button>
        }
      />

      <div className="chip-row">
        {Object.keys(facultyToMajors).map((chip) => (
          <button
            key={chip}
            className={chip === selectedFaculty ? 'chip active' : 'chip'}
            type="button"
            onClick={() => setSelectedFaculty(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="content-split">
        <aside className="filter-rail">
          <SearchPanel title="Búsqueda" placeholder="Palabras clave..." value={searchQuery} onChange={setSearchQuery} />
          <FilterGroup
            title="Estado"
            options={['Todos', 'En convocatoria', 'Activo', 'En planificación', 'Cerrado']}
            selected={selectedStatus}
            onChange={setSelectedStatus}
          />
          <FilterGroup
            title="Ubicación"
            options={['Todas', 'San Salvador', 'Santa Ana', 'San Miguel', 'La Libertad', 'Chalatenango']}
            selected={selectedLocation}
            onChange={setSelectedLocation}
          />
        </aside>

        <section className="list-panel">
          <div className="list-meta">
            <span>
              Mostrando <strong>{filteredProjects.length}</strong> proyectos
            </span>
            <button
              className="link-button text-link"
              type="button"
              onClick={() =>
                setSortBy((s) => (s === 'recentes' ? 'titulo' : s === 'titulo' ? 'ubicacion' : 'recentes'))
              }
            >
              Ordenar por:{' '}
              <strong>{sortBy === 'recentes' ? 'Más recientes' : sortBy === 'titulo' ? 'Título' : 'Ubicación'}</strong>
            </button>
          </div>

          <div className="project-feed">
            {filteredProjects.map((project) => (
              <ProjectListCard key={project.id} project={project} />
            ))}
          </div>

          <div className="center-actions">
            <button className="secondary-btn load-more-btn" type="button">
              <span className="spin-dot" />
              Cargar más proyectos
            </button>
          </div>
        </section>
      </div>

      {modalNuevo ? <CreateProjectModal onClose={() => setSearchParams({})} /> : null}
    </div>
  );
}

// ─── ProyectoDetallePage ──────────────────────────────────────────────────────
export function ProyectoDetallePage() {
  const { id = '' } = useParams();
  let project = proyectosMapa.find((p) => p.id === id);
  if (!project) {
    const found = instituciones.flatMap((i) => i.proyectos).find((p) => p.id === id);
    if (found) project = { ...found, resumen: found.descripcion, personas: 3 } as any;
  }
  if (!project) project = proyectosMapa[0];

  return (
    <div className="detail-page wide-page">
      <BackLink to="/proyectos" label="Volver a proyectos" />

      <div className="project-detail-hero">
        <img
          src={`/images/${project.id}.jpg`}
          alt={project.titulo}
          onError={(e) => {
            e.currentTarget.src =
              'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22300%22%3E%3Crect fill=%22%238db179%22 width=%22600%22 height=%22300%22/%3E%3C/svg%3E';
          }}
        />
        <div className="project-detail-hero-content">
          <div className="project-detail-hero-topline">
            <span className={`pill status ${clasificacionEstado[project.estado]}`}>{project.estado}</span>
            <span>{project.institucion}</span>
            <span className="dot">•</span>
            <span>{project.ubicacion}</span>
          </div>
          <h1>{project.titulo}</h1>
        </div>
      </div>

      <div className="project-detail-body">
        <section className="detail-main">
          <div className="detail-section">
            <h2>Acerca del Proyecto</h2>
            <p>{project.descripcion}</p>
          </div>

          <div className="detail-section">
            <h2>Objetivos clave</h2>
            <div className="objectives-list">
              {['Plantar 5,000 Árboles', 'Educación Comunitaria', 'Monitoreo del Suelo', 'Levantamiento de Biodiversidad'].map(
                (obj, i) => (
                  <div className="objective-card" key={obj}>
                    <div className="objective-index">{i + 1}</div>
                    <div>
                      <h3>{obj}</h3>
                      <p>Iniciativa de impacto directo en la comunidad local.</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <aside className="detail-sidebar">
          <div className="detail-meta-card">
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>Equipo del Proyecto</h3>
            <div className="team-grid" style={{ gridTemplateColumns: '1fr' }}>
              {project.equipo && project.equipo.length > 0 ? (
                project.equipo.map((name) => (
                  <div key={name} className="team-member-card" style={{ flexDirection: 'row', padding: '12px' }}>
                    <div className="member-avatar" style={{ width: '40px', height: '40px' }}>
                      {name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 2px', fontSize: '0.95rem' }}>{name}</h4>
                      <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>Colaborador</p>
                    </div>
                    <button className="icon-btn" style={{ padding: 0, width: 'auto', color: '#2d63e2' }}>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="muted">No hay información del equipo.</p>
              )}
            </div>
            <button className="text-link" style={{ marginTop: '12px', width: '100%', textAlign: 'center' }}>
              Ver Directorio Completo
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
