import { MapPinned, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Proyecto } from '../types';
import { clasificacionEstado } from '../data/proyectos';
import { AvatarGroup } from './ui';

// ─── ProjectListCard ──────────────────────────────────────────────────────────
export function ProjectListCard({
  project,
  onEnroll,
}: {
  project: Proyecto;
  onEnroll?: (project: Proyecto) => void;
}) {
  const cuposMaximos = 5;
  const cuposOcupados = Math.min(project.equipo.length, cuposMaximos);
  const cuposDisponibles = Math.max(cuposMaximos - cuposOcupados, 0);
  const tieneCupos = cuposDisponibles > 0;

  return (
    <article className="project-list-card">
      <div className="project-list-main">
        <div className="project-summary-topline">
          <span className={`pill status ${clasificacionEstado[project.estado]}`}>{project.estado}</span>
          <span>{project.institucion}</span>
          <span className="dot">•</span>
          <span>{project.ubicacion}</span>
        </div>
        <h3>{project.titulo}</h3>
        <p className="summary-copy">{project.descripcion}</p>
        <div className="majors-row">
          {project.carreras.map((major) => (
            <span key={major} className="major-pill">
              {major}
            </span>
          ))}
        </div>
      </div>
      <div className="project-list-stats">
        <div>
          <span>Cupos</span>
          <strong>{`${cuposOcupados} de ${cuposMaximos}`}</strong>
        </div>
        {tieneCupos ? (
          <button className="primary-btn project-enroll-btn" type="button" onClick={() => onEnroll?.(project)}>
            Inscribir estudiante
          </button>
        ) : (
          <div className="closed-box project-full-box">Cupos llenos</div>
        )}
        <Link className="text-link project-details-link" to={`/proyectos/${project.id}`}>
          Ver detalles
        </Link>
      </div>
    </article>
  );
}

// ─── ProjectCompactCard ───────────────────────────────────────────────────────
export function ProjectCompactCard({ project }: { project: Proyecto }) {
  return (
    <article className="compact-project-card">
      <div className="project-summary-topline">{project.institucion}</div>
      <div className="compact-head">
        <h3>{project.titulo}</h3>
        <div className={`pill status ${clasificacionEstado[project.estado]}`}>{project.estado}</div>
      </div>
      <p className="muted with-icon">
        <MapPinned size={15} />
        {project.ubicacion}
      </p>
      <div className="compact-footer">
        <AvatarGroup count={project.equipo.length} />
        <Link className="text-link" to={`/proyectos/${project.id}`}>
          Ver detalles
        </Link>
      </div>
    </article>
  );
}

// ─── ProjectMapCard ───────────────────────────────────────────────────────────
export function ProjectTeamCard({
  member,
  role,
}: {
  member: string;
  role: string;
}) {
  const initials = member
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="team-card">
      <div className="avatar-circle">{initials}</div>
      <div className="member-info">
        <p className="member-name">{member}</p>
        <p className="member-role">{role}</p>
      </div>
      <MessageSquare size={18} className="contact-icon" />
    </div>
  );
}
