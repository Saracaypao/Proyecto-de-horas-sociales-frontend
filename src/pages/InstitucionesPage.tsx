import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import InstitutionCard from '../components/InstitutionCard';
import { ProjectCompactCard } from '../components/ProjectCards';
import { BackLink, SearchPanel } from '../components/ui';
import { instituciones } from '../data/instituciones';

// ─── InstitucionesPage ────────────────────────────────────────────────────────
export function InstitucionesPage() {
  const [activeFilter, setActiveFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'nombre' | 'proyectos'>('nombre');

  const categorias = [
    'Todos',
    'Universidades Públicas',
    'Universidades Privadas',
    'Escuelas Técnicas',
    'Institutos Especializados',
  ];

  const institutionImages = [
    'InstitutionDetailView.jpeg',
    'InstitutionDetailViewCopy.jpeg',
    'InstitutionsDirectory.jpeg',
    'ProjectsDirectoryDetailedView.jpeg',
    'MainMapDashboard.jpeg',
    'EmployeeLogin.jpeg',
    'StudentLogin.jpeg',
    'StudentsbyProject.jpeg',
    'StudentProjectDetail.jpeg',
    'InstitutionDetailView.jpeg',
  ];

  const filteredInstitutions = instituciones
    .filter((inst) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        [inst.nombre, inst.ubicacion, inst.descripcion, inst.tipo ?? ''].some((v) =>
          v.toLowerCase().includes(query)
        );
      const matchesCategory =
        categorias[activeFilter] === 'Todos' ||
        (categorias[activeFilter] === 'Universidades Públicas' && (inst.tipo ?? '').toLowerCase().includes('public')) ||
        (categorias[activeFilter] === 'Universidades Privadas' && (inst.tipo ?? '').toLowerCase().includes('private')) ||
        (categorias[activeFilter] === 'Escuelas Técnicas' && (inst.tipo ?? '').toLowerCase().includes('technical')) ||
        (categorias[activeFilter] === 'Institutos Especializados' && (inst.tipo ?? '').toLowerCase().includes('institute'));
      return matchesQuery && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'proyectos') return b.proyectos.length - a.proyectos.length;
      return a.nombre.localeCompare(b.nombre);
    });

  return (
    <div className="directory-page wide-page">
      <div className="page-header-top">
        <div className="title-section">
          <h1 className="main-title">Instituciones Aliadas</h1>
          <p className="main-description">
            Explora universidades, escuelas técnicas e institutos de todo El Salvador que participan en
            iniciativas de proyectos estudiantiles.
          </p>
        </div>

        <div className="actions-section">
          <div className="search-wrapper">
            <Search size={18} className="search-icon-inside" />
            <input
              type="text"
              placeholder="Buscar instituciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="filter-action-btn"
            type="button"
            onClick={() => setActiveFilter((c) => (c + 1) % categorias.length)}
          >
            <Filter size={16} />
            <span>Filtrar</span>
          </button>
          <button
            className="filter-action-btn"
            type="button"
            onClick={() => setSortBy((c) => (c === 'nombre' ? 'proyectos' : 'nombre'))}
          >
            <SlidersHorizontal size={16} />
            <span>{sortBy === 'nombre' ? 'Ordenar' : 'Más proyectos'}</span>
          </button>
        </div>
      </div>

      <div className="filter-pills-container">
        {categorias.map((cat, index) => (
          <button
            key={cat}
            className={`filter-pill ${index === activeFilter ? 'active' : ''}`}
            onClick={() => setActiveFilter(index)}
            type="button"
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="institution-grid">
        {filteredInstitutions.map((inst, i) => {
          const imageSrc = `/images/${institutionImages[i % institutionImages.length]}`;
          return (
            <Link key={inst.id} to={`/instituciones/${inst.id}`} className="institution-card-link">
              <InstitutionCard institution={inst} imageUrl={imageSrc} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── InstitutionTabs ──────────────────────────────────────────────────────────
function InstitutionTabs({ institution }: { institution: (typeof instituciones)[number] }) {
  const [tab, setTab] = useState<'general' | 'projects' | 'past' | 'students'>('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const proyectos = institution.proyectos ?? [];
  const matchProject = (project: (typeof proyectos)[number]) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      [project.titulo, project.ubicacion, project.descripcion, project.carreras.join(' ')].some((v) =>
        v.toLowerCase().includes(query)
      );
    const matchesStatus = statusFilter === 'Todos' || project.estado === statusFilter;
    return matchesQuery && matchesStatus;
  };

  const proyectosActivos = proyectos.filter((p) => p.estado !== 'Cerrado').filter(matchProject);
  const proyectosPasados = proyectos.filter((p) => p.estado === 'Cerrado').filter(matchProject);

  return (
    <>
      <div className="tabs-row">
        {(['general', 'projects', 'past', 'students'] as const).map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} type="button" onClick={() => setTab(t)}>
            {t === 'general' ? 'General' : t === 'projects' ? 'Proyectos activos' : t === 'past' ? 'Proyectos pasados' : 'Estudiantes'}
          </button>
        ))}
      </div>

      <div className="institution-content">
        <section className="projects-zone" style={{ display: tab === 'projects' ? 'block' : 'none' }}>
          <div className="section-heading-row">
            <h2>Iniciativas actuales</h2>
            <div className="inline-tools">
              <SearchPanel
                title=""
                placeholder={`Buscar proyectos de ${institution.sigla?.split(' ')[0] ?? ''}...`}
                compact
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <button
                className="secondary-btn"
                type="button"
                onClick={() =>
                  setStatusFilter((c) =>
                    c === 'Todos' ? 'Activo' : c === 'Activo' ? 'En convocatoria' : c === 'En convocatoria' ? 'Cerrado' : 'Todos'
                  )
                }
              >
                Filtrar
              </button>
            </div>
          </div>
          <div className="institution-project-grid">
            {proyectosActivos.length
              ? proyectosActivos.map((p) => <ProjectCompactCard key={p.id} project={p} />)
              : <p>No hay proyectos activos.</p>}
          </div>
        </section>

        <section className="projects-zone" style={{ display: tab === 'past' ? 'block' : 'none' }}>
          <div className="section-heading-row"><h2>Proyectos pasados</h2></div>
          <div className="institution-project-grid">
            {proyectosPasados.length
              ? proyectosPasados.map((p) => <ProjectCompactCard key={p.id} project={p} />)
              : <p>No hay proyectos pasados.</p>}
          </div>
        </section>

        <section style={{ display: tab === 'general' ? 'block' : 'none' }}>
          <div className="section-heading-row"><h2>General</h2></div>
          <p>{institution.descripcion}</p>
        </section>

        <section style={{ display: tab === 'students' ? 'block' : 'none' }}>
          <div className="section-heading-row"><h2>Estudiantes</h2></div>
          <p>Listado de estudiantes asignados (si aplica).</p>
        </section>
      </div>
    </>
  );
}

// ─── InstitucionDetallePage ───────────────────────────────────────────────────
export function InstitucionDetallePage() {
  const { id = 'ues' } = useParams();
  const institution = instituciones.find((i) => i.id === id) ?? instituciones[0];

  return (
    <div className="detail-page wide-page">
      <BackLink to="/instituciones" label="Volver a instituciones" />

      <section className="institution-hero">
        <div className="checker-bg" />
        <div className="institution-header-row">
          <div className="floating-logo" />
          <div className="institution-meta">
            <span className="eyebrow-tag">Universidad destacada</span>
            <span className="muted">{institution.ubicacion}</span>
            <h1>{institution.nombre}</h1>
            <p>{institution.descripcion}</p>
          </div>
        </div>
        <div className="stats-row">
          {institution.estadisticas.map(([value, label]) => (
            <div key={label} className="stat-block">
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <InstitutionTabs institution={institution} />
    </div>
  );
}
