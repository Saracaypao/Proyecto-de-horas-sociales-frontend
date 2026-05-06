import { CreditCard, GraduationCap, X, UserRound } from 'lucide-react';
import { Field } from './ui';

export default function InscribirEstudianteModal({
  projectTitle,
  onClose,
}: {
  projectTitle: string;
  onClose: () => void;
}) {
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Inscribir estudiante en ${projectTitle}`}
    >
      <form className="modal-card enrollment-modal" onSubmit={(e) => {
        e.preventDefault();
        onClose();
      }}>
        <div className="modal-header">
          <div>
            <h2>Inscribir estudiante</h2>
            <p className="modal-subtitle">{projectTitle}</p>
          </div>
          <button className="icon-btn small" type="button" onClick={onClose} aria-label="Cerrar modal">
            <X size={16} />
          </button>
        </div>

        <div className="form-grid">
          <Field label="Nombre del estudiante" placeholder="Nombre completo" icon={<UserRound size={18} />} />
          <Field label="Carnet" placeholder="Ej. 20230045" icon={<CreditCard size={18} />} />
          <Field label="Carrera" placeholder="Ej. Ingeniería en Sistemas" icon={<GraduationCap size={18} />} />
        </div>

        <div className="modal-footer">
          <button className="secondary-btn" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary-btn" type="submit">
            Inscribir estudiante
          </button>
        </div>
      </form>
    </div>
  );
}
