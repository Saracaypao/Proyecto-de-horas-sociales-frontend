import { Building2, CalendarDays, CreditCard, ImagePlus, Layers3, MapPinned, Plus, Trash2, UserRound, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { createProject, parseCsvList, toDataUrl } from '../services/api';
import { Field } from './ui';

type StudentDraft = {
  nombre: string;
  carnet: string;
  carrera: string;
  email: string;
  genero: 'Masculino' | 'Femenino' | '';
};

export default function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const institutionFileInputRef = useRef<HTMLInputElement>(null);
  const [projectPreviewUrl, setProjectPreviewUrl] = useState<string | null>(null);
  const [projectFileName, setProjectFileName] = useState<string | null>(null);
  const [projectImageDataUrl, setProjectImageDataUrl] = useState<string | null>(null);
  const [institutionPreviewUrl, setInstitutionPreviewUrl] = useState<string | null>(null);
  const [institutionFileName, setInstitutionFileName] = useState<string | null>(null);
  const [institutionImageDataUrl, setInstitutionImageDataUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState('');
  const [institutionLocation, setInstitutionLocation] = useState('');
  const [institutionDescription, setInstitutionDescription] = useState('');
  const [faculty, setFaculty] = useState('');
  const [careers, setCareers] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState('');
  const [students, setStudents] = useState<StudentDraft[]>([
    { nombre: '', carnet: '', carrera: '', email: '', genero: '' },
  ]);

  function handleProjectFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProjectFileName(file.name);
    void toDataUrl(file).then((dataUrl) => {
      setProjectPreviewUrl(dataUrl);
      setProjectImageDataUrl(dataUrl);
    });
  }

  function handleInstitutionFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setInstitutionFileName(file.name);
    void toDataUrl(file).then((dataUrl) => {
      setInstitutionPreviewUrl(dataUrl);
      setInstitutionImageDataUrl(dataUrl);
    });
  }

  function handleRemoveProjectImage() {
    setProjectPreviewUrl(null);
    setProjectFileName(null);
    if (projectFileInputRef.current) projectFileInputRef.current.value = '';
  }

  function handleRemoveInstitutionImage() {
    setInstitutionPreviewUrl(null);
    setInstitutionFileName(null);
    if (institutionFileInputRef.current) institutionFileInputRef.current.value = '';
  }

  function handleStudentChange(index: number, field: keyof StudentDraft, value: string) {
    setStudents((current) =>
      current.map((student, studentIndex) =>
        studentIndex === index ? { ...student, [field]: value } : student
      )
    );
  }

  function addStudentRow() {
    setStudents((current) => [
      ...current,
      { nombre: '', carnet: '', carrera: '', email: '', genero: '' },
    ]);
  }

  function removeStudentRow(index: number) {
    setStudents((current) => {
      if (current.length === 1) return current;
      return current.filter((_, studentIndex) => studentIndex !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const normalizedStudents = students
      .map((student) => ({
        nombre: student.nombre.trim(),
        carnet: student.carnet.trim(),
        carrera: student.carrera.trim(),
        email: student.email.trim(),
        genero: student.genero || undefined,
      }))
      .filter((student) => student.nombre || student.carnet || student.carrera || student.email);

    if (normalizedStudents.length === 0) {
      setError('Agrega al menos un estudiante con nombre y carnet');
      setIsSaving(false);
      return;
    }

    if (normalizedStudents.some((student) => !student.nombre || !student.carnet || !student.carrera || !student.email)) {
      setError('Completa nombre, carnet, carrera y email en todos los estudiantes asignados');
      setIsSaving(false);
      return;
    }

    const normalizedCareers = parseCsvList(careers);

    if (normalizedCareers.length === 0) {
      setError('Agrega al menos una carrera que pueda aplicar');
      setIsSaving(false);
      return;
    }

    if (!institutionImageDataUrl) {
      setError('Debes subir una imagen de la institución');
      setIsSaving(false);
      return;
    }

    if (!projectImageDataUrl) {
      setError('Debes subir una imagen del proyecto');
      setIsSaving(false);
      return;
    }

    try {
      await createProject({
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
        resumen: description.slice(0, 160),
        fechaInicio: startDate || undefined,
        fechaCierre: endDate || undefined,
        cupos: slots ? Number(slots) : undefined,
        projectImage: projectImageDataUrl,
        image: projectImageDataUrl,
        students: normalizedStudents.map((student) => ({
          nombre: student.nombre,
          carnet: student.carnet,
          carrera: student.carrera || normalizedCareers[0] || '',
          email: student.email,
          genero: student.genero,
        })),
      });

      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar el proyecto');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Crear nuevo proyecto">
      <form className="modal-card" onSubmit={handleSubmit}>

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
            <Field label="Institución" placeholder="Nombre de la institución o entidad" icon={<Building2 size={18} />} value={institutionName} onChange={(event) => setInstitutionName(event.target.value)} required />
            <Field label="Tipo de institución" placeholder="Ej. Universidad pública, privada, instituto" value={institutionType} onChange={(event) => setInstitutionType(event.target.value)} required />
            <Field label="Ubicación de la institución" placeholder="Ej. San Salvador, El Salvador" icon={<MapPinned size={18} />} value={institutionLocation} onChange={(event) => setInstitutionLocation(event.target.value)} required />
            <Field
              label="Descripción de la institución"
              placeholder="Describe brevemente la institución..."
              textarea
              value={institutionDescription}
              onChange={(event) => setInstitutionDescription(event.target.value)}
              required
            />
            <Field label="Facultad" placeholder="Ej. Arquitectura e Ingeniería" icon={<Layers3 size={18} />} value={faculty} onChange={(event) => setFaculty(event.target.value)} required />
            <Field
              label="Carreras que pueden aplicar"
              placeholder="Ej. Ingeniería en Sistemas, Arquitectura, Diseño"
              icon={<Layers3 size={18} />}
              value={careers}
              onChange={(event) => setCareers(event.target.value)}
              textarea
              required
            />
            <Field label="Nombre del proyecto" placeholder="Ej. Campaña de salud comunitaria" icon={<Plus size={18} />} value={title} onChange={(event) => setTitle(event.target.value)} required />
            <Field label="Ubicación" placeholder="Municipio / departamento" icon={<MapPinned size={18} />} value={location} onChange={(event) => setLocation(event.target.value)} required />
            <Field label="Fecha de inicio" placeholder="YYYY-MM-DD" type="date" icon={<CalendarDays size={18} />} value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
            <Field label="Fecha de cierre" placeholder="YYYY-MM-DD" type="date" icon={<CalendarDays size={18} />} value={endDate} onChange={(event) => setEndDate(event.target.value)} required />
            <Field label="Cupos del proyecto" placeholder="Ej. 5" type="number" value={slots} onChange={(event) => setSlots(event.target.value)} required />
          </div>

          <Field
            label="Descripción del proyecto"
            placeholder="Describe los objetivos e impacto del proyecto..."
            textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />

          <div className="student-assignment-block">
            <div className="student-assignment-header">
              <div>
                <h3>Estudiantes asignados</h3>
                <p>Agrega uno o más estudiantes con su nombre y carnet.</p>
              </div>
              <button type="button" className="secondary-btn student-add-btn" onClick={addStudentRow}>
                <Plus size={16} />
                Agregar estudiante
              </button>
            </div>

            <div className="student-assignment-list">
              {students.map((student, index) => (
                <div className="student-assignment-row" key={`${index}-${student.carnet}`}>
                  <Field
                    label="Nombre del estudiante"
                    placeholder="Nombre completo"
                    icon={<UserRound size={18} />}
                    value={student.nombre}
                    onChange={(event) => handleStudentChange(index, 'nombre', event.target.value)}
                    required
                  />
                  <Field
                    label="Carnet"
                    placeholder="Ej. 20230045"
                    icon={<CreditCard size={18} />}
                    value={student.carnet}
                    onChange={(event) => handleStudentChange(index, 'carnet', event.target.value)}
                    required
                  />
                  <Field
                    label="Carrera del estudiante"
                    placeholder="Ej. Ingeniería en Sistemas"
                    icon={<Layers3 size={18} />}
                    value={student.carrera}
                    onChange={(event) => handleStudentChange(index, 'carrera', event.target.value)}
                    required
                  />
                  <Field
                    label="Email del estudiante"
                    placeholder="correo@ejemplo.com"
                    value={student.email}
                    onChange={(event) => handleStudentChange(index, 'email', event.target.value)}
                    required
                  />
                  <div className="field-wrapper">
                    <label className="field-label">Género</label>
                    <select
                      value={student.genero}
                      onChange={(e) => handleStudentChange(index, 'genero', e.target.value)}
                      className="field-input"
                    >
                      <option value="">Seleccione un género</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                  </div>
                  {students.length > 1 ? (
                    <button
                      type="button"
                      className="student-row-remove"
                      onClick={() => removeStudentRow(index)}
                      aria-label={`Eliminar estudiante ${index + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Campo de imagen */}
          <div className="modal-image-field">
            <span className="modal-image-label">Imagen de la institución</span>

            {institutionPreviewUrl ? (
              <div className="modal-image-preview">
                <img src={institutionPreviewUrl} alt="Vista previa de la institución" />
                <div className="modal-image-overlay">
                  <span className="modal-image-filename">{institutionFileName}</span>
                  <button
                    type="button"
                    className="modal-image-remove"
                    onClick={handleRemoveInstitutionImage}
                    aria-label="Eliminar imagen de la institución"
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
                onClick={() => institutionFileInputRef.current?.click()}
              >
                <div className="modal-image-dropzone-icon">
                  <ImagePlus size={26} />
                </div>
                <p className="modal-image-dropzone-title">Subir imagen de la institución</p>
                <p className="modal-image-dropzone-hint">PNG, JPG o WEBP · Máx. 5 MB</p>
              </button>
            )}

            <input
              ref={institutionFileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              style={{ display: 'none' }}
              onChange={handleInstitutionFileChange}
              required
            />
          </div>

          <div className="modal-image-field">
            <span className="modal-image-label">Imagen del proyecto</span>

            {projectPreviewUrl ? (
              <div className="modal-image-preview">
                <img src={projectPreviewUrl} alt="Vista previa del proyecto" />
                <div className="modal-image-overlay">
                  <span className="modal-image-filename">{projectFileName}</span>
                  <button
                    type="button"
                    className="modal-image-remove"
                    onClick={handleRemoveProjectImage}
                    aria-label="Eliminar imagen del proyecto"
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
                onClick={() => projectFileInputRef.current?.click()}
              >
                <div className="modal-image-dropzone-icon">
                  <ImagePlus size={26} />
                </div>
                <p className="modal-image-dropzone-title">Subir imagen del proyecto</p>
                <p className="modal-image-dropzone-hint">PNG, JPG o WEBP · Máx. 5 MB</p>
              </button>
            )}

            <input
              ref={projectFileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              style={{ display: 'none' }}
              onChange={handleProjectFileChange}
              required
            />
          </div>

          {error ? <p className="modal-error">{error}</p> : null}
        </div>

        {/* Footer fijo con botones siempre visibles */}
        <div className="modal-footer">
          <button className="modal-btn-cancel" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal-btn-save" type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar y publicar proyecto'}
          </button>
        </div>

      </form>
    </div>
  );
}