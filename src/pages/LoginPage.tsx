import { Building2, Eye, GraduationCap, Layers3, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Field } from '../components/ui';

export default function LoginPage({ tipo }: { tipo: 'docente' | 'estudiante' }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) navigate('/mapa');
  };

  const isDocente = tipo === 'docente';
  const title = isDocente ? 'Faculty & Staff Portal' : 'Bienvenido';
  const subtitle = isDocente
    ? 'Secure access for university employees.'
    : 'Por favor ingresa tus credenciales para continuar.';
  const icon = isDocente ? <Building2 size={40} /> : <GraduationCap size={40} />;
  const emailLabel = isDocente ? 'Institutional Email' : 'Student Email or ID';
  const emailPlaceholder = isDocente ? 'e.g. jdoe@uni.edu.sv' : 'e.g. student@uni.edu.sv';

  return (
    <div className="login-page employee-login">
      <div className="login-shell">
        <div className="login-card card-type-employee">
          <div className="login-strip" />
          <div className="login-icon">{icon}</div>
          <h1>{title}</h1>
          <p>{subtitle}</p>

          <form className="login-form" onSubmit={handleLogin}>
            <Field
              label={emailLabel}
              placeholder={emailPlaceholder}
              icon={<Mail size={18} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Field
              label="Password"
              placeholder="••••••••"
              icon={<Lock size={18} />}
              suffix={<Eye size={18} />}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label className="remember-row">
              <input
                type="checkbox"
                className="check"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember my device</span>
            </label>
            <button className="primary-btn large" type="submit">
              {isDocente && <Layers3 size={18} />}
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
