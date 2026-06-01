import { Building2, CalendarDays, ImagePlus, Layers3, MapPinned, Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toDataUrl, parseCsvList, updateProject } from '../services/api';
import { Field } from './ui';
import type { ProjectDetailResponse } from '../services/api';

type EditProjectPayload = {
  institutionName: string;
  institutionType: string;
  institutionLocation: string;
  institutionDescription: string;
  institutionImage?: string | null;
  facultad: string;
  carreras: string[];
  titulo: string;
  ubicacion: string;
  descripcion: string;
  fechaInicio?: string;
  fechaCierre?: string;
  cupos?: number;
  projectImage?: string | null;
};

export default function EditProjectModal({
  project,
  onClose,
  onSaved,
}: {
  project: ProjectDetailResponse;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const institutionFileInputRef = useRef<HTMLInputElement>(null);

  const [projectPreviewUrl, setProjectPreviewUrl] = useState<string | null>(project.imagen);
  const [projectImageDataUrl, setProjectImageDataUrl] = useState<string | null>(null);
  const [institutionPreviewUrl, setInstitutionPreviewUrl] = useState<string | null>(null);
  const [institutionImageDataUrl, setInstitutionImageDataUrl] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [institutionName, setInstitutionName] = useState(project.institution ?? '');
  const [institutionType, setInstitutionType] = useState('');
  const [institutionLocation, setInstitutionLocation] = useState(project.ubicacion ?? '');
  const [institutionDescription, setInstitutionDescription] = useState('');
  const [faculty, setFaculty] = useState('');
  const [careers, setCareers] = useState((project.carreras ?? []).join(', '));
  const [title, setTitle] = useState(project.titulo ?? project.nombre ?? '');
  const [location, setLocation] = useState(project.ubicacion ?? '');
  const [startDate, setStartDate] = useState(project.fechaInicio?.slice(0, 10) ?? '');
  const [endDate, setEndDate] = useState(project.fechaCierre?.slice(0, 10) ?? '');
  const [description, setDescription] = useState(project.descripcion ?? project.resumen ?? '');
  const [slots, setSlots] = useState(project.cuposTotales != null ? String(project.cuposTotales) : '');

  function handleProjectFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    void toDataUrl(file).then((dataUrl) => {
      setProjectPreviewUrl(dataUrl);
      setProjectImageDataUrl(dataUrl);
    });
  }

  function handleInstitutionFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    void toDataUrl(file).then((dataUrl) => {
      setInstitutionPreviewUrl(dataUrl);
      setInstitutionImageDataUrl(dataUrl);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const normalizedCareers = parseCsvList(careers);
    if (normalizedCareers.length === 0) {
      setError('Agrega al menos una carrera');
      setIsSaving(false);
      return;
    }

    try {
      await updateProject(project.id, {
        institutionName,
        institutionType,
        institutionLocation,
        institutionDescription,
        institutionImage: institutionImageDataUrl,
        facultad: faculty,
        carreras: normalizedCareers,
        titulo: title,
        ubicacion: location,
        descripcion: description,
        fechaInicio: startDate || undefined,
        fechaCierre: endDate || undefined,
        cupos: slots ? Number(slots) : undefined,
        projectImage: projectImageDataUrl,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el proyecto');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Editar proyecto">
      <form className="modal-card" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>Editar proyecto</h2>
          <button className="icon-btn small" type="button" onClick={onClose} aria-label="Cerrar modal">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body-scroll">
          <div className="form-grid">
            <Field label="Institución" placeholder="Nombre de la institución" icon={<Building2 size={18} />} value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} required />
            <Field label="Tipo de institución" placeholder="Ej. Universidad pública, privada" value={institutionType} onChange={(e) => setInstitutionType(e.target.value)} />
            <Field label="Ubicación de la institución" placeholder="Ej. San Salvador" icon={<MapPinned size={18} />} value={institutionLocation} onChange={(e) => setInstitutionLocation(e.target.value)} required />
            <Field label="Descripción de la institución" placeholder="Describe brevemente la institución..." textarea value={institutionDescription} onChange={(e) => setInstitutionDescription(e.target.value)} />
            <Field label="Facultad" placeholder="Ej. Arquitectura e Ingeniería" icon={<Layers3 size={18} />} value={faculty} onChange={(e) => setFaculty(e.target.value)} />
            <Field label="Carreras que pueden aplicar" placeholder="Ej. Ingeniería en Sistemas, Arquitectura" icon={<Layers3 size={18} />} value={careers} onChange={(e) => setCareers(e.target.value)} textarea required />
            <Field label="Nombre del proyecto" placeholder="Ej. Campaña de salud comunitaria" icon={<Plus size={18} />} value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Field label="Ubicación" placeholder="Municipio / departamento" icon={<MapPinned size={18} />} value={location} onChange={(e) => setLocation(e.target.value)} required />
            <Field label="Fecha de inicio" type="date" icon={<CalendarDays size={18} />} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Field label="Fecha de cierre" type="date" icon={<CalendarDays size={18} />} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <Field label="Cupos del proyecto" placeholder="Ej. 5" type="number" value={slots} onChange={(e) => setSlots(e.target.value)} />
          </div>

          <Field label="Descripción del proyecto" placeholder="Describe los objetivos e impacto..." textarea value={description} onChange={(e) => setDescription(e.target.value)} required />

          {/* Imagen institución */}
          <div className="modal-image-field">
            <span className="modal-image-label">Imagen de la institución (opcional)</span>
            {institutionPreviewUrl ? (
              <div className="modal-image-preview">
                <img src={institutionPreviewUrl} alt="Vista previa institución" />
                <div className="modal-image-overlay">
                  <button type="button" className="modal-image-remove" onClick={() => { setInstitutionPreviewUrl(null); setInstitutionImageDataUrl(null); }} aria-label="Quitar imagen">
                    <X size={14} /> Quitar imagen
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="modal-image-dropzone" onClick={() => institutionFileInputRef.current?.click()}>
                <div className="modal-image-dropzone-icon"><ImagePlus size={26} /></div>
                <p className="modal-image-dropzone-title">Subir imagen de la institución</p>
                <p className="modal-image-dropzone-hint">PNG, JPG o WEBP · Máx. 5 MB</p>
              </button>
            )}
            <input ref={institutionFileInputRef} type="file" accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} onChange={handleInstitutionFileChange} />
          </div>

          {/* Imagen proyecto */}
          <div className="modal-image-field">
            <span className="modal-image-label">Imagen del proyecto (opcional)</span>
            {projectPreviewUrl ? (
              <div className="modal-image-preview">
                <img src={projectPreviewUrl} alt="Vista previa proyecto" />
                <div className="modal-image-overlay">
                  <button type="button" className="modal-image-remove" onClick={() => { setProjectPreviewUrl(null); setProjectImageDataUrl(null); }} aria-label="Quitar imagen">
                    <X size={14} /> Quitar imagen
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="modal-image-dropzone" onClick={() => projectFileInputRef.current?.click()}>
                <div className="modal-image-dropzone-icon"><ImagePlus size={26} /></div>
                <p className="modal-image-dropzone-title">Subir imagen del proyecto</p>
                <p className="modal-image-dropzone-hint">PNG, JPG o WEBP · Máx. 5 MB</p>
              </button>
            )}
            <input ref={projectFileInputRef} type="file" accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} onChange={handleProjectFileChange} />
          </div>

          {error ? <p className="modal-error">{error}</p> : null}
        </div>

        <div className="modal-footer">
          <button className="modal-btn-cancel" type="button" onClick={onClose}>Cancelar</button>
          <button className="modal-btn-save" type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
