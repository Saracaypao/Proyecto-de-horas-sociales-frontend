import { Building2, CalendarDays, ImagePlus, Layers3, MapPinned, Plus, Sparkles, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Field } from './ui';

export default function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName]     = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setPreviewUrl(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Crear nuevo proyecto">
      <div className="modal-card">

        {/* Header fijo */}
        <div className="modal-header">
          <h2>Crear nuevo proyecto</h2>
          <button className="icon-btn small" type="button" onClick={onClose} aria-label="Cerrar modal">
            <X size={16} />
          </button>
        </div>

        {/* Cuerpo con scroll */}
        <div className="modal-body-scroll">
          <div className="form-grid">
            <Field label="Institución"             placeholder="Seleccionar institución"           icon={<Building2 size={18} />} />
            <Field label="Facultad / departamento" placeholder="Seleccionar facultad"              icon={<Layers3 size={18} />} />
            <Field label="Nombre del proyecto"     placeholder="Ej. Campaña de salud comunitaria" icon={<Plus size={18} />} />
            <Field label="Ubicación"               placeholder="Municipio / departamento"          icon={<MapPinned size={18} />} />
            <Field label="Fecha de inicio"         placeholder="MM/DD/AAAA"                        icon={<CalendarDays size={18} />} />
            <Field label="Fecha de cierre"         placeholder="MM/DD/AAAA"                        icon={<CalendarDays size={18} />} />
          </div>

          <Field
            label="Descripción del proyecto"
            placeholder="Describe los objetivos e impacto del proyecto..."
            textarea
          />

          {/* Campo de imagen */}
          <div className="modal-image-field">
            <span className="modal-image-label">
              Imagen del proyecto
            </span>

            {previewUrl ? (
              <div className="modal-image-preview">
                <img src={previewUrl} alt="Vista previa" />
                <div className="modal-image-overlay">
                  <span className="modal-image-filename">{fileName}</span>
                  <button
                    type="button"
                    className="modal-image-remove"
                    onClick={handleRemoveImage}
                    aria-label="Eliminar imagen"
                  >
                    <X size={14} />
                    Quitar imagen
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="modal-image-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="modal-image-dropzone-icon">
                  <ImagePlus size={26} />
                </div>
                <p className="modal-image-dropzone-title">Subir imagen del proyecto</p>
                <p className="modal-image-dropzone-hint">PNG, JPG o WEBP · Máx. 5 MB</p>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Footer fijo con botones siempre visibles */}
        <div className="modal-footer">
          <button className="modal-btn-cancel" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal-btn-save" type="button">
            Guardar y publicar proyecto
          </button>
        </div>

      </div>
    </div>
  );
}
