import { CalendarDays, ChevronLeft, Filter, MapPinned, MessageSquare, SlidersHorizontal, Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { AvatarGroup } from '../components/ui';
import { clasificacionEstado, proyectosMapa } from '../data/proyectos';
import type { ProyectoMapa } from '../types';

export default function MapaVistaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const proyectoId = searchParams.get('proyecto') ?? 'cerro-verde';
  const proyectoSeleccionado = proyectosMapa.find((p) => p.id === proyectoId) ?? proyectosMapa[0];
  const mostrarDetalle = searchParams.has('proyecto');

  const focoMapa =
    proyectoSeleccionado.id === 'cerro-verde'
      ? '56% 48%'
      : proyectoSeleccionado.id === 'alfabetizacion-digital'
      ? '67% 40%'
      : proyectoSeleccionado.id === 'paneles-solares'
      ? '82% 68%'
      : '47% 55%';

  return (
    <div className="dashboard-grid map-layout">
      <aside className="sidebar map-sidebar">
        {!mostrarDetalle ? (
          <div className="projects-list-container">
            <div className="section-header">
              <h2 className="sidebar-title">Proyectos activos</h2>
              <div className="icon-group">
                <button className="icon-btn" aria-label="Filtrar proyectos">
                  <Filter size={18} />
                </button>
                <button className="icon-btn" aria-label="Ajustar vista">
                  <SlidersHorizontal size={18} />
                </button>
              </div>
            </div>

            <div className="stack-list cards-scroll sidebar-projects-list">
              {proyectosMapa.map((project) => (
                <article className="project-summary-card" key={project.id}>
                  <div className="project-summary-topline">{project.institucion}</div>
                  <div className={`pill status ${clasificacionEstado[project.estado]}`}>{project.estado}</div>
                  <h3>{project.titulo}</h3>
                  <p className="muted with-icon">
                    <MapPinned size={15} />
                    {project.ubicacion}
                  </p>
                  <p className="summary-copy">{project.resumen}</p>
                  <div className="avatar-row">
                    <AvatarGroup count={project.personas} />
                    <button
                      className="text-link link-button"
                      type="button"
                      onClick={() => setSearchParams({ proyecto: project.id })}
                    >
                      Ver detalles
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <ProjectMapDetail
            project={proyectoSeleccionado}
            onReset={() => setSearchParams({})}
          />
        )}
      </aside>

      <section className="map-panel">
        <div className="map-toolbar">
          <div className="legend-pill">
            <span className="legend men" /> Hombres
            <span className="legend women" /> Mujeres
          </div>
          <button className="mini-chip" onClick={() => setSearchParams({ proyecto: proyectoSeleccionado.id })}>
            Centrar mapa
          </button>
        </div>
        <div className={`map-scene ${mostrarDetalle ? 'focused' : ''}`} style={{ transformOrigin: focoMapa }}>
          <iframe
            className="map-iframe"
            title="Google Maps - El Salvador"
            src="https://www.google.com/maps?q=El%20Salvador&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="map-reset-floating">
            <button className="secondary-btn" type="button" onClick={() => setSearchParams({})}>
              <ChevronLeft size={18} />
              Restablecer mapa
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── ProjectMapDetail ─────────────────────────────────────────────────────────
function ProjectMapDetail({
  project,
  onReset,
}: {
  project: ProyectoMapa;
  onReset: () => void;
}) {
  const teamRoles = ['Líder del proyecto', 'Logística', 'Enlace comunitario', 'Apoyo académico'];
  const projectImage = project.imagen ?? '/images/ProjectsDirectoryDetailedView.jpeg';

  return (
    <div className="projects-list-container animate-fade-in">
      <div className="section-header">
        <button onClick={onReset} className="back-link" type="button">
          <ChevronLeft size={16} />
          <span>Volver</span>
        </button>
      </div>

      <div className="stack-list cards-scroll sidebar-projects-list">
        <div className="project-detail-card-single">
          <div className="project-detail-hero">
            <img src={projectImage} alt={project.titulo} className="project-main-img" />
          </div>

          <div className="detail-body">
            <span className="inst-name">UNIVERSIDAD DE EL SALVADOR</span>
            <h2 className="detail-title">{project.titulo}</h2>

            <div className="detail-meta">
              <p><MapPinned size={14} /> {project.ubicacion}</p>
              <p><CalendarDays size={14} /> Ene 2024 - Dic 2024</p>
              <p><Users size={14} /> {project.personas} estudiantes asignados</p>
            </div>

            <div className="detail-description">
              <h3>Acerca del proyecto</h3>
              <p>{project.resumen}</p>
            </div>

            <div className="team-section">
              <div className="team-header">
                <h3>Equipo del proyecto</h3>
                <button className="link-btn" type="button">Ver todo</button>
              </div>
              <div className="team-list">
                {project.equipo.map((member, index) => {
                  const initials = member.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <div className="team-card" key={member}>
                      <div className="avatar-circle">{initials}</div>
                      <div className="member-info">
                        <p className="member-name">{member}</p>
                        <p className="member-role">{teamRoles[index] ?? 'Colaborador'}</p>
                      </div>
                      <MessageSquare size={18} className="contact-icon" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
