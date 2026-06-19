import { CalendarDays, ChevronLeft, MapPinned, Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { AvatarGroup } from '../components/ui';
import { clasificacionEstado, proyectosMapa, marcadoresMapa } from '../data/proyectos';
import type { ProyectoMapa } from '../types';
import { getMapMarkers, getProjects, getGenderByMunicipio, type ProjectDetailResponse } from '../services/api';
import { countGenders } from '../utils/genderDetect';
import { coordenadasDepartamentos } from '../data/departamentos';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


function normalizeVisibleStatus(estado?: string | null, status?: string | null): ProyectoMapa['estado'] {
  if (status === 'Cerrado' || estado === 'Cerrado') return 'Cerrado';
  if (status === 'Activo' || estado === 'Activo') return 'Activo';
  return 'En progreso';
}

export default function MapaVistaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<ProyectoMapa[]>(proyectosMapa);
  const [markers, setMarkers] = useState(marcadoresMapa);
  const [loadingData, setLoadingData] = useState(true);
  const [projectDetail, setProjectDetail] = useState<ProjectDetailResponse | null>(null);
  const proyectoId = searchParams.get('proyecto') ?? String(projects[0]?.id ?? '');
  const proyectoSeleccionado = projects.find((p) => String(p.id) === proyectoId) ?? projects[0];
  const mostrarDetalle = searchParams.has('proyecto');

  const getGeneroData = (projectId: string) => {
  const marcadores = markers.filter((m) => m.id !== null && String(m.id) === projectId);
    let totalHombres = 0;
    let totalMujeres = 0;
    marcadores.forEach((m) => {
      totalHombres += m.hombres;
      totalMujeres += m.mujeres;
    });
    if (totalHombres === 0 && totalMujeres === 0) {
      const project = projects.find((p) => String(p.id) === projectId);
      if (project && project.equipo.length > 0) {
        const counts = countGenders(project.equipo);
        return counts;
      }
    }
    return { hombres: totalHombres, mujeres: totalMujeres };
  };

  const focoMapa = '50% 50%';

  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    let active = true;

    async function loadMapData() {
      try {
        setLoadingData(true);

        const [apiProjects, apiMarkers, apiGeneroMunicipio] = await Promise.all([
          getProjects(),
          getMapMarkers(),
          getGenderByMunicipio(),
        ]);
        if (!active) return;

        const mappedProjects: ProyectoMapa[] = apiProjects.map((project) => ({
          id: String(project.id),
          institucion: project.institution ?? 'Institución',
          titulo: project.titulo,
          ubicacion: project.ubicacion,
          estado: normalizeVisibleStatus(project.estado, project.status),
          carreras: project.carreras ?? [],
          descripcion: project.descripcion ?? '',
          resumen: project.descripcion ?? '',
          equipo: project.equipo ?? [],
          personas: Number(project.personas ?? (project.equipo?.length ?? 0)),
        }));

// Marcadores ligados a proyectos específicos (tabla map_markers, si existe)
          const projectMarkers = apiMarkers
            .filter((marker) => marker.projectId !== null)
            .map((marker) => ({
              id: String(marker.id),
              projectId: String(marker.projectId),
              label: marker.label,
              hombres: Number(marker.hombres ?? 0),
              mujeres: Number(marker.mujeres ?? 0),
              lat: Number(marker.lat),
              lng: Number(marker.lng),
            }));

          // Marcadores por departamento, calculados dinámicamente desde la BD
          const departmentMarkers = apiGeneroMunicipio
            .map((row) => {
              const coords = coordenadasDepartamentos[row.municipio];
              if (!coords) return null;
              return {
                id: `depto-${row.municipio}`,
                projectId: null as string | null,
                label: row.municipio,
                hombres: row.hombres,
                mujeres: row.mujeres,
                lat: coords.lat,
                lng: coords.lng,
              };
            })
            .filter((m): m is NonNullable<typeof m> => m !== null);

          const mappedMarkers = [...departmentMarkers, ...projectMarkers];

        setProjects(mappedProjects.length > 0 ? mappedProjects : proyectosMapa);
        setMarkers(mappedMarkers.length > 0 ? mappedMarkers : marcadoresMapa);
      } catch {
        if (!active) return;
        setProjects(proyectosMapa);
        setMarkers(marcadoresMapa);
      } finally {
        if (active) setLoadingData(false);
      }
    }

    loadMapData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!mostrarDetalle || !proyectoId) {
      setProjectDetail(null);
      return;
    }
    let active = true;
    import('../services/api').then(({ getProjectById }) => {
      getProjectById(proyectoId)
        .then((data) => { if (active) setProjectDetail(data); })
        .catch(() => { if (active) setProjectDetail(null); });
    });
    return () => { active = false; };
  }, [proyectoId, mostrarDetalle]);

  // Inicializar mapa Leaflet una sola vez
  useEffect(() => {
    if (!L?.map) return;

    const map = L.map('leaflet-map', {
      center: [13.7, -88.9],
      zoom: 8,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

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
    const map = mapRef.current;
    if (!map || !L?.layerGroup) return;

    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    } else {
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    const markersToShow = mostrarDetalle && proyectoSeleccionado
      ? markers.filter((m) => m.id !== null && String(m.id) === String(proyectoSeleccionado.id))
      : markers;

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

    if (mostrarDetalle) {
      const pts = markersToShow.map((m) => [m.lat, m.lng]);
      if (pts.length === 1) {
        map.setView(pts[0], 10);
      } else if (pts.length > 1) {
        const bounds = L.latLngBounds(pts as any);
        map.fitBounds(bounds.pad(0.5));
      }
    }
  }, [markers, mostrarDetalle, proyectoSeleccionado]);

  return (
    <div className="dashboard-grid map-layout">
      <aside className="sidebar map-sidebar">
        {!mostrarDetalle ? (
          <div className="projects-list-container">
            <div className="section-header">
              <h2 className="sidebar-title">Proyectos activos</h2>
            </div>

            {loadingData ? <p className="muted" style={{ padding: '0 16px' }}>Cargando proyectos...</p> : null}

            <div className="sidebar-projects-list">
              {projects.map((project) => {
                const generoData = getGeneroData(String(project.id));
                const estadoClass = clasificacionEstado[project.estado] ?? 'recruiting';
                // Generar iniciales del equipo para avatares
                const teamInitials = project.equipo.slice(0, 3).map((nombre) =>
                  nombre.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
                );
                const extraCount = project.personas > 3 ? project.personas - 3 : 0;

                return (
                  <article className="map-project-card" key={project.id}>
                    {/* Header: estado + ubicación */}
                    <div className="map-card-header">
                      <span className={`pill status ${estadoClass}`}>{project.estado}</span>
                      <span className="map-card-location">
                        <MapPinned size={11} />
                        {project.ubicacion}
                      </span>
                    </div>

                    {/* Institución */}
                    <p className="map-card-institution">{project.institucion.toUpperCase()}</p>

                    {/* Título */}
                    <h3 className="map-card-title">{project.titulo}</h3>

                    {/* Descripción */}
                    <p className="map-card-description">{project.descripcion || project.resumen}</p>

                    {/* Footer: género + avatares + ver detalles */}
                    <div className="map-card-footer">
                      <div className="map-card-gender">
                        <span className="gender-item">
                          <span className="gender-dot men" />
                          Hombres: <strong>{generoData.hombres}</strong>
                        </span>
                        <span className="gender-item">
                          <span className="gender-dot women" />
                          Mujeres: <strong>{generoData.mujeres}</strong>
                        </span>
                      </div>
                      <div className="map-card-actions">
                        <div className="map-card-avatars">
                          {teamInitials.map((initials, i) => (
                            <span
                              key={initials + i}
                              className="map-avatar"
                              style={{ marginLeft: i > 0 ? '-8px' : 0 }}
                              title={project.equipo[i]}
                            >
                              {initials}
                            </span>
                          ))}
                          {extraCount > 0 && (
                            <span className="map-avatar map-avatar-extra" style={{ marginLeft: '-8px' }}>
                              +{extraCount}
                            </span>
                          )}
                        </div>
                        <button
                          className="map-card-detail-link"
                          type="button"
                          onClick={() => setSearchParams({ proyecto: String(project.id) })}
                        >
                          Ver detalles
                        </button>
                      </div>
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
            generoData={getGeneroData(String(proyectoSeleccionado.id))}
            projectDetail={projectDetail}
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
  projectDetail,
}: {
  project: ProyectoMapa;
  onReset: () => void;
  generoData: { hombres: number; mujeres: number };
  projectDetail: ProjectDetailResponse | null;
}) {
  const projectImage = project.imagen ?? (projectDetail?.imagen ?? null);
  const formatDate = (value: string | null | undefined) => {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  };

  const allNames = projectDetail
    ? [
        ...(projectDetail.estudiantes ?? []).map((s) => s.nombre ?? ''),
        ...(projectDetail.equipo ?? []),
      ].filter(Boolean)
    : project.equipo;
  const computedGender = countGenders(allNames);
  const displayHombres = generoData.hombres > 0 ? generoData.hombres : computedGender.hombres;
  const displayMujeres = generoData.mujeres > 0 ? generoData.mujeres : computedGender.mujeres;

  const estudiantesDetalle = projectDetail?.estudiantes ?? [];
  const equipoNombres = projectDetail?.equipo ?? project.equipo;

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
          {projectImage ? (
            <div className="project-detail-hero">
              <img src={projectImage} alt={project.titulo} className="project-main-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
          ) : null}

          <div className="detail-body">
            <span className="inst-name">{(projectDetail?.institution ?? project.institucion).toUpperCase()}</span>
            <h2 className="detail-title">{projectDetail?.titulo ?? project.titulo}</h2>

            <div className="detail-meta">
              <p><MapPinned size={14} /> {projectDetail?.ubicacion ?? project.ubicacion}</p>
              {projectDetail?.fechaInicio || projectDetail?.fechaCierre ? (
                <p><CalendarDays size={14} /> {formatDate(projectDetail.fechaInicio)} – {formatDate(projectDetail.fechaCierre)}</p>
              ) : null}
              <p>
                <Users size={14} />
                {' '}{projectDetail?.estudiantesAsignados ?? project.personas} estudiantes asignados
              </p>
            </div>

            <div style={{ backgroundColor: '#f5f5f5', padding: '12px 16px', borderRadius: '8px', marginTop: '16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>Estudiantes</p>
              <div style={{ display: 'flex', gap: '20px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#007bff' }} />
                  <strong>{displayHombres}</strong> Hombres
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#dc3545' }} />
                  <strong>{displayMujeres}</strong> Mujeres
                </span>
              </div>
            </div>

            <div className="detail-description">
              <h3>Acerca del proyecto</h3>
              <p>{projectDetail?.resumen ?? projectDetail?.descripcion ?? project.resumen}</p>
            </div>

            <div className="team-section">
              <div className="team-header">
                <h3>Equipo del proyecto</h3>
              </div>
              <div className="team-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {estudiantesDetalle.length > 0
                  ? estudiantesDetalle.map((student) => {
                    const initials = (student.nombre ?? '')
                      .split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase();
                    return (
                      <div
                        key={`${student.carnet}-${student.nombre}`}
                        style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '12px 14px', borderRadius: 12, background: '#f8faff', border: '1px solid #e8edf8' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3972f0, #21c08a)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '0.78rem', fontWeight: 800, flexShrink: 0 }}>
                            {initials}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1c2433' }}>
                            {student.nombre}
                          </p>
                        </div>
                        <div style={{ height: 1, background: '#e8edf8', marginBottom: 8 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {student.carrera ? <p style={{ margin: 0, fontSize: '0.76rem', color: '#687182', fontWeight: 600 }}>{student.carrera}</p> : null}
                          {student.carnet ? <p style={{ margin: 0, fontSize: '0.73rem', color: '#9aa3b5' }}>Carnet: {student.carnet}</p> : null}
                          {student.email ? <p style={{ margin: 0, fontSize: '0.70rem', color: '#9aa3b5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.email}</p> : null}
                        </div>
                      </div>
                    );
                  })
                  : equipoNombres.map((member) => {
                    const initials = member.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
                    return (
                      <div key={member} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: '#f8faff', border: '1px solid #e8edf8' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #3972f0, #21c08a)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '0.8rem', fontWeight: 800, flexShrink: 0 }}>
                          {initials}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700 }}>{member}</p>
                          <p style={{ margin: 0, fontSize: '0.76rem', color: '#687182' }}>Colaborador</p>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
