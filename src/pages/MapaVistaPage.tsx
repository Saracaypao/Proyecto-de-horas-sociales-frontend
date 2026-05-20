import { CalendarDays, ChevronLeft, MapPinned, MessageSquare, Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { AvatarGroup } from '../components/ui';
import { clasificacionEstado, proyectosMapa, marcadoresMapa } from '../data/proyectos';
import type { ProyectoMapa } from '../types';
import 'leaflet/dist/leaflet.css';

// Note: this page now uses Leaflet. Install the dependency with:
//   npm install leaflet

export default function MapaVistaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const proyectoId = searchParams.get('proyecto') ?? 'cerro-verde';
  const proyectoSeleccionado = proyectosMapa.find((p) => p.id === proyectoId) ?? proyectosMapa[0];
  const mostrarDetalle = searchParams.has('proyecto');

  // Función para obtener datos de hombres y mujeres para un proyecto
  const getGeneroData = (projectId: string) => {
    const marcadores = marcadoresMapa.filter((m) => m.id === projectId);
    let totalHombres = 0;
    let totalMujeres = 0;
    marcadores.forEach((m) => {
      totalHombres += m.hombres;
      totalMujeres += m.mujeres;
    });
    return { hombres: totalHombres, mujeres: totalMujeres };
  };

  const focoMapa =
    proyectoSeleccionado.id === 'cerro-verde'
      ? '56% 48%'
      : proyectoSeleccionado.id === 'alfabetizacion-digital'
      ? '67% 40%'
      : proyectoSeleccionado.id === 'paneles-solares'
      ? '82% 68%'
      : '47% 55%';

  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  // Inicializar mapa Leaflet una sola vez
  useEffect(() => {
    let L: any;
    let map: any;
    const init = async () => {
      L = await import('leaflet');
      // create map
      map = L.map('leaflet-map', {
        center: [13.7, -88.9],
        zoom: 8,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    };

    init();

    return () => {
      try {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // Actualizar marcadores y centrar/zoom cuando cambie el proyecto seleccionado
  useEffect(() => {
    (async () => {
      const L = await import('leaflet');
      const map = mapRef.current;
      if (!map) return;

      // limpiar capa de marcadores
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
      } else {
        markersLayerRef.current = L.layerGroup().addTo(map);
      }

      // seleccionar marcadores a mostrar
      const markersToShow = mostrarDetalle
        ? marcadoresMapa.filter((m) => m.id === proyectoSeleccionado.id)
        : marcadoresMapa;

      // Agrupar marcadores por proyecto (id) y mostrar una sola tarjeta con totales
      const groups: Record<string, { latSum: number; lngSum: number; hombres: number; mujeres: number; count: number }> = {};
      markersToShow.forEach((m) => {
        if (!groups[m.id]) {
          groups[m.id] = { latSum: 0, lngSum: 0, hombres: 0, mujeres: 0, count: 0 };
        }
        groups[m.id].latSum += m.lat;
        groups[m.id].lngSum += m.lng;
        groups[m.id].hombres += m.hombres;
        groups[m.id].mujeres += m.mujeres;
        groups[m.id].count += 1;
      });

      Object.keys(groups).forEach((id) => {
        const g = groups[id];
        const avgLat = g.latSum / g.count;
        const avgLng = g.lngSum / g.count;

        const html = `
          <div class="gender-marker">
            <div class="marker-box">
              <div class="marker-row">
                <span class="marker-item"><span class="dot men"></span><span class="num">${g.hombres}</span></span>
                <span class="marker-item"><span class="dot women"></span><span class="num">${g.mujeres}</span></span>
              </div>
            </div>
          </div>`;

        const icon = L.divIcon({ className: '', html });
        L.marker([avgLat, avgLng], { icon }).addTo(markersLayerRef.current);
      });

      // centrar/zoom si se muestra detalle
      if (mostrarDetalle) {
        const pts = markersToShow.map((m) => [m.lat, m.lng]);
        if (pts.length === 1) {
          map.setView(pts[0], 10);
        } else if (pts.length > 1) {
          const bounds = L.latLngBounds(pts as any);
          map.fitBounds(bounds.pad(0.5));
        }
      }
    })();
  }, [mostrarDetalle, proyectoSeleccionado]);

  return (
    <div className="dashboard-grid map-layout">
      <aside className="sidebar map-sidebar">
        {!mostrarDetalle ? (
          <div className="projects-list-container">
            <div className="section-header">
              <h2 className="sidebar-title">Proyectos activos</h2>
            </div>

            <div className="stack-list cards-scroll sidebar-projects-list">
              {proyectosMapa.map((project) => {
                const generoData = getGeneroData(project.id);
                return (
                  <article className="project-summary-card" key={project.id}>
                    <div className="project-summary-topline">{project.institucion}</div>
                    <div className={`pill status ${clasificacionEstado[project.estado]}`}>{project.estado}</div>
                    <h3>{project.titulo}</h3>
                    <p className="muted with-icon">
                      <MapPinned size={15} />
                      {project.ubicacion}
                    </p>
                    <p className="summary-copy">{project.resumen}</p>
                    
                    {/* Mostrar género stats */}
                    <div className="gender-stats" style={{ display: 'flex', gap: '16px', marginTop: '12px', marginBottom: '12px', fontSize: '13px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#007bff' }} />
                        Hombres: {generoData.hombres}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc3545' }} />
                        Mujeres: {generoData.mujeres}
                      </span>
                    </div>
                    
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
                );
              })}
            </div>
          </div>
        ) : (
          <ProjectMapDetail
            project={proyectoSeleccionado}
            onReset={() => setSearchParams({})}
            generoData={getGeneroData(proyectoSeleccionado.id)}
          />
        )}
      </aside>

      <section className="map-panel">
        <div className="map-toolbar">
          <div className="legend-pill">
            <span className="legend men" /> Hombres
            <span className="legend women" /> Mujeres
          </div>
        </div>
        <div className={`map-scene ${mostrarDetalle ? 'focused' : ''}`} style={{ transformOrigin: focoMapa, position: 'relative' }}>
          {/* Leaflet map container (replaces iframe) */}
          <div id="leaflet-map" className="map-iframe" style={{ position: 'absolute', inset: 0 }} />
          
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
  generoData,
}: {
  project: ProyectoMapa;
  onReset: () => void;
  generoData: { hombres: number; mujeres: number };
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

            {/* Mostrar género stats en detalle */}
            <div className="detail-gender-stats" style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              marginTop: '16px',
              marginBottom: '16px'
            }}>
              <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>Estudiantes</p>
              <div style={{ display: 'flex', gap: '20px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#007bff' }} />
                  <strong>{generoData.hombres}</strong> Hombres
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#dc3545' }} />
                  <strong>{generoData.mujeres}</strong> Mujeres
                </span>
              </div>
            </div>

            <div className="detail-description">
              <h3>Acerca del proyecto</h3>
              <p>{project.resumen}</p>
            </div>

            <div className="team-section">
              <div className="team-header">
                <h3>Equipo del proyecto</h3>
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
