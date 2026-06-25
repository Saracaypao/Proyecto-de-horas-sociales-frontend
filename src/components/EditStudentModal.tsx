import { CreditCard, GraduationCap, X, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Field } from './ui';

export interface EnrolledStudent {
    id: string;          // enrollment id
    student_id?: string;
    nombre?: string;
    carnet?: string;
    carrera?: string;
    genero?: 'Masculino' | 'Femenino' | null;
    email?: string | null;
    avatar?: string | null;
    cargo?: string;
}

interface Props {
    student: EnrolledStudent;
    projectId: string;
    onClose: () => void;
    onSaved: () => void;
    updateFn: (projectId: string, body: any) => Promise<unknown>;
}

export default function EditStudentModal({ student, projectId, onClose, onSaved, updateFn }: Props) {
    const [name, setName] = useState(student.nombre ?? '');
    const [carnet, setCarnet] = useState(student.carnet ?? '');
    const [career, setCareer] = useState(student.carrera ?? '');
    const [email, setEmail] = useState(student.email ?? '');
    const [gender, setGender] = useState<'Masculino' | 'Femenino' | ''>(student.genero ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            console.log('Enviando:', { projectId, nombre: name, carnet, carrera: career, genero: gender, email });
            const result = await updateFn(projectId, {
                nombre: name,
                carnet,
                carrera: career,
                genero: gender || undefined,
                email: email || undefined,
            });
            console.log('Respuesta:', result);
            onSaved();
            onClose();
        } catch (err) {
            console.error('Error:', err);
            setError(err instanceof Error ? err.message : 'No se pudo actualizar');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Editar estudiante">
            <form className="modal-card enrollment-modal" onSubmit={handleSubmit}>
                <div className="modal-header">
                    <div>
                        <h2>Editar estudiante</h2>
                        <p className="modal-subtitle">{student.nombre}</p>
                    </div>
                    <button className="icon-btn small" type="button" onClick={onClose} aria-label="Cerrar modal">
                        <X size={16} />
                    </button>
                </div>

                <div className="form-grid">
                    <Field label="Nombre" placeholder="Nombre completo" icon={<UserRound size={18} />}
                        value={name} onChange={(e) => setName(e.target.value)} required />
                    <Field label="Carnet" placeholder="Ej. 20230045" icon={<CreditCard size={18} />}
                        value={carnet} onChange={(e) => setCarnet(e.target.value)} required />
                    <Field label="Carrera" placeholder="Ej. Ingeniería en Sistemas" icon={<GraduationCap size={18} />}
                        value={career} onChange={(e) => setCareer(e.target.value)} required />
                    <Field label="Email (opcional)" placeholder="estudiante@ejemplo.edu.sv" icon={<UserRound size={18} />}
                        value={email} onChange={(e) => setEmail(e.target.value)} />
                    <div className="field-wrapper">
                        <label className="field-label">Género</label>
                        <select value={gender} onChange={(e) => setGender(e.target.value as '' | 'Masculino' | 'Femenino')}
                            className="field-input">
                            <option value="">Seleccione un género</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                        </select>
                    </div>
                </div>

                {error ? <p className="modal-error">{error}</p> : null}

                <div className="modal-footer">
                    <button className="secondary-btn" type="button" onClick={onClose}>Cancelar</button>
                    <button className="primary-btn" type="submit" disabled={isSaving}>
                        {isSaving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}