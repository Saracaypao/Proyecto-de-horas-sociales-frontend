import { MapPin as MapPinned } from "lucide-react";
import { Link } from "react-router-dom";

interface Institucion {
  id: string;
  nombre: string;
  ubicacion?: string;
  tipo?: string;
  image?: string;
  estadisticas?: [string, string][];
}

export default function InstitutionCard({
  institution,
  imageUrl,
}: {
  institution: Institucion;
  imageUrl: string;
}) {
  return (
    <div className="uca-card-v2">
      <div className="uca-card-header">
        <img src={imageUrl} alt={institution.nombre} />
        <div className="uca-verified-badge">Verified</div>
      </div>

      <div className="uca-card-body">
        <span className="uca-category-tag">{institution.tipo?.toUpperCase() || 'PRIVATE UNIVERSITY'}</span>
        <h2 className="uca-card-title">{institution.nombre}</h2>

        <div className="uca-card-location">
          <MapPinned size={14} />
          <span>{institution.ubicacion}</span>
        </div>

        <div className="uca-card-stats-container">
          {institution.estadisticas?.slice(0, 2).map(([value, label]) => (
            <div key={label} className="uca-stat-line">
              <span className="stat-label">{label}</span>
              <span className="stat-value">{value}</span>
            </div>
          ))}
        </div>

        <Link to={`/instituciones/${institution.id}`} className="uca-card-button">
          Ver institución
        </Link>
      </div>
    </div>
  );
}
