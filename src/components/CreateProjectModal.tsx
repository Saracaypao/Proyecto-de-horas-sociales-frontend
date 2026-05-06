import { Building2, CalendarDays, Layers3, MapPinned, Plus, Sparkles, X } from 'lucide-react';
import { Field } from './ui';

export default function CreateProjectModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Crear nuevo proyecto">
      <div className="modal-card">
        <div className="modal-header">
          <h2>Crear nuevo proyecto</h2>
          <button className="icon-btn small" type="button" onClick={onClose} aria-label="Cerrar modal">
            <X size={16} />
          </button>
        </div>

        <div className="form-grid">
          <Field label="Institución" placeholder="Seleccionar institución" icon={<Building2 size={18} />} />
          <Field label="Facultad / departamento" placeholder="Seleccionar facultad" icon={<Layers3 size={18} />} />
          <Field label="Nombre del proyecto" placeholder="Ej. Campaña de salud comunitaria" icon={<Plus size={18} />} />
          <Field label="Ubicación" placeholder="Municipio / departamento" icon={<MapPinned size={18} />} />
          <Field label="Fecha de inicio" placeholder="MM/DD/AAAA" icon={<CalendarDays size={18} />} />
          <Field label="Fecha de cierre" placeholder="MM/DD/AAAA" icon={<CalendarDays size={18} />} />
        </div>

        <Field
          label="Descripción del proyecto"
          placeholder="Describe los objetivos e impacto del proyecto..."
          textarea
        />

        <div className="modal-footer">
          <button className="secondary-btn" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary-btn" type="button">
            <Sparkles size={18} />
            Guardar y publicar proyecto
          </button>
        </div>
      </div>
    </div>
  );
}
