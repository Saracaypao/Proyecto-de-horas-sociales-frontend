import {
  ArrowRight,
  ArrowLeft,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Eye,
  Filter,
  GraduationCap,
  Layers3,
  Lock,
  LogOut,
  Mail,
  MapPinned,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom';
import InstitutionCard from './components/InstitutionCard';

type EstadoProyecto = 'Activo' | 'En planificación' | 'En convocatoria' | 'Cerrado';

type Proyecto = {
  id: string;
  institucion: string;
  titulo: string;
  ubicacion: string;
  estado: EstadoProyecto;
  carreras: string[];
  fechaLimite?: string;
  cupos?: string;
  imagen?: string;
  descripcion: string;
  equipo: string[];
};

type Institucion = {
  id: string;
  nombre: string;
  sigla: string;
  ubicacion: string;
  tipo?: string;
  image?: string;
  descripcion: string;
  estadisticas: [string, string][];
  proyectos: Proyecto[];
};

type Estudiante = {
  nombre: string;
  cargo: string;
  carrera: string;
  avatar: string;
};

const navItems = [
  { to: '/mapa', label: 'Vista de mapa' },
  { to: '/instituciones', label: 'Instituciones' },
  { to: '/proyectos', label: 'Proyectos' },
  { to: '/estudiantes', label: 'Estudiantes' },
];

const proyectosMapa: Array<Proyecto & { resumen: string; personas: number }> = [
  {
    id: 'cerro-verde',
    institucion: 'Universidad de El Salvador',
    titulo: 'Reforestación en Cerro Verde',
    ubicacion: 'Santa Ana, El Salvador',
    estado: 'Activo',
    carreras: ['Biología', 'Ciencias Ambientales', 'Educación'],
    descripcion: 'Equipo ambiental que trabaja con guardaparques y comunidades locales para restaurar flora nativa.',
    equipo: ['Ana García', 'Carlos Méndez', 'Sofía Rodríguez', 'Diego Torres'],
    resumen: 'Proyecto ambiental sostenible centrado en recuperación de especies nativas y trabajo comunitario.',
    personas: 4,
  },
  {
    id: 'alfabetizacion-digital',
    institucion: 'Universidad Centroamericana',
    titulo: 'Alfabetización digital para escuelas rurales',
    ubicacion: 'Chalatenango, El Salvador',
    estado: 'En convocatoria',
    carreras: ['Educación', 'Informática', 'Sociología'],
    descripcion: 'Talleres de habilidades digitales, acceso a computadoras y navegación segura para niñas, niños y adultos.',
    equipo: ['Valeria Cruz', 'Diego Flores', 'Ana López'],
    resumen: 'Programa práctico para habilidades digitales, acceso a computadoras y hábitos seguros en internet.',
    personas: 6,
  },
  {
    id: 'paneles-solares',
    institucion: 'Universidad Don Bosco',
    titulo: 'Paneles solares para comunidades',
    ubicacion: 'San Miguel, El Salvador',
    estado: 'En planificación',
    carreras: ['Ingeniería', 'Electrónica', 'Gestión'],
    descripcion: 'Implementación de soluciones energéticas pequeñas para centros comunitarios y escuelas.',
    equipo: ['Luis Herrera', 'Karen Álvarez', 'Marta Flores'],
    resumen: 'Despliegue de soluciones de energía renovable a pequeña escala para comunidades y escuelas.',
    personas: 3,
  },
  {
    id: 'emprendimientos-locales',
    institucion: 'Escuela Mónica Herrera',
    titulo: 'Acompañamiento de comercio electrónico',
    ubicacion: 'Santa Tecla, El Salvador',
    estado: 'En convocatoria',
    carreras: ['Mercadeo', 'Administración', 'Diseño Gráfico'],
    descripcion: 'Acompañamiento a comerciantes para lanzar ventas en línea y fortalecer su presencia digital.',
    equipo: ['Camila Vargas', 'Andrés Morales', 'Luis Méndez'],
    resumen: 'Apoyo a comercios locales para vender por internet y mejorar su presencia digital.',
    personas: 5,
  },
];

const marcadoresMapa = [
  { label: 'Santa Ana', hombres: 14, mujeres: 18, top: 28, left: 18, id: 'cerro-verde' },
  { label: 'San Salvador', hombres: 45, mujeres: 52, top: 52, left: 43, id: 'alfabetizacion-digital' },
  { label: 'Chalatenango', hombres: 8, mujeres: 12, top: 22, left: 61, id: 'alfabetizacion-digital' },
  { label: 'La Libertad', hombres: 15, mujeres: 19, top: 68, left: 39, id: 'emprendimientos-locales' },
  { label: 'San Miguel', hombres: 22, mujeres: 20, top: 74, left: 86, id: 'paneles-solares' },
  { label: 'Usulután', hombres: 6, mujeres: 9, top: 89, left: 74, id: 'paneles-solares' },
];

const instituciones: Institucion[] = [
  {
    id: 'ues',
    nombre: 'Universidad de El Salvador (UES)',
    sigla: 'UNIVERSIDAD DE EL SALVADOR',
    ubicacion: 'San Salvador, sede central',
    tipo: 'Public University',
    image: 'https://picsum.photos/seed/ues/800/400',
    descripcion:
      'La universidad pública más grande del país, con una fuerte presencia en proyectos de servicio social, investigación y vinculación comunitaria.',
    estadisticas: [
      ['24', 'Proyectos activos'],
      ['156', 'Estudiantes asignados'],
      ['12', 'Facultades'],
    ],
    proyectos: [
      {
        id: 'cerro-verde',
        institucion: 'UNIVERSIDAD DE EL SALVADOR',
        titulo: 'Reforestación en Cerro Verde',
        ubicacion: 'Santa Ana, El Salvador',
        estado: 'Activo',
        carreras: ['Biología', 'Ciencias Ambientales', 'Educación'],
        descripcion: 'Equipos trabajan con guardaparques para restaurar flora nativa y monitorear biodiversidad.',
        equipo: ['Ana García', 'Carlos Méndez', 'Sofía Rodríguez', 'Diego Torres'],
      },
      {
        id: 'salud-publica',
        institucion: 'UNIVERSIDAD DE EL SALVADOR',
        titulo: 'Campaña de salud pública',
        ubicacion: 'San Miguel, El Salvador',
        estado: 'Activo',
        carreras: ['Medicina', 'Enfermería', 'Salud Pública'],
        descripcion: 'Charlas y jornadas de prevención en comunidades, centros escolares y unidades de salud.',
        equipo: ['María López', 'Ricardo Cruz', 'Javier Peña'],
      },
      {
        id: 'huertos-urbanos',
        institucion: 'UNIVERSIDAD DE EL SALVADOR',
        titulo: 'Taller de huertos urbanos',
        ubicacion: 'San Salvador, El Salvador',
        estado: 'Activo',
        carreras: ['Agronomía', 'Biología', 'Economía'],
        descripcion: 'Capacitación para producir alimentos en espacios reducidos con técnicas sostenibles.',
        equipo: ['Luis Herrera', 'Karen Álvarez', 'Marta Flores', 'Néstor Ruiz'],
      },
    ],
  },
  {
    id: 'uca',
    nombre: 'Universidad Centroamericana (UCA)',
    sigla: 'UNIVERSIDAD CENTROAMERICANA (UCA)',
    ubicacion: 'Antiguo Cuscatlán',
    tipo: 'Private University',
    image: 'https://picsum.photos/seed/uca/800/400',
    descripcion:
      'Universidad privada con enfoque en impacto social, innovación y colaboración multidisciplinaria.',
    estadisticas: [
      ['18', 'Proyectos activos'],
      ['92', 'Estudiantes asignados'],
      ['8', 'Facultades'],
    ],
    proyectos: [
      {
        id: 'alfabetizacion-digital',
        institucion: 'UNIVERSIDAD CENTROAMERICANA (UCA)',
        titulo: 'Alfabetización digital para comunidades rurales',
        ubicacion: 'Chalatenango, El Salvador',
        estado: 'En convocatoria',
        carreras: ['Educación', 'Informática', 'Sociología'],
        descripcion: 'Habilidades básicas de computadora y seguridad digital para personas adultas y jóvenes.',
        equipo: ['Valeria Cruz', 'Diego Flores', 'Ana López'],
      },
      {
        id: 'emprendimientos-locales',
        institucion: 'UNIVERSIDAD CENTROAMERICANA (UCA)',
        titulo: 'Acompañamiento de comercio electrónico',
        ubicacion: 'Santa Tecla, El Salvador',
        estado: 'Activo',
        carreras: ['Mercadeo', 'Administración', 'Diseño Gráfico'],
        descripcion: 'Apoyo a comerciantes para migrar sus ventas a plataformas digitales y redes sociales.',
        equipo: ['Camila Vargas', 'Andrés Morales', 'Luis Méndez'],
      },
    ],
  },
  {
    id: 'udb',
    nombre: 'Universidad Don Bosco (UDB)',
    sigla: 'UNIVERSIDAD DON BOSCO',
    ubicacion: 'Soyapango, El Salvador',
    tipo: 'Private University',
    image: 'https://picsum.photos/seed/udb/800/400',
    descripcion: 'Institución educativa comprometida con la formación integral y el desarrollo social comunitario.',
    estadisticas: [
      ['15', 'Proyectos activos'],
      ['78', 'Estudiantes asignados'],
      ['6', 'Facultades'],
    ],
    proyectos: [],
  },
  {
    id: 'espol',
    nombre: 'Escuela Politécnica de El Salvador (ESPOL)',
    sigla: 'ESPOL',
    ubicacion: 'Santa Tecla, El Salvador',
    tipo: 'Private University',
    image: 'https://picsum.photos/seed/espol/800/400',
    descripcion: 'Centro de excelencia en formación técnica y transferencia tecnológica para la industria.',
    estadisticas: [
      ['22', 'Proyectos activos'],
      ['145', 'Estudiantes asignados'],
      ['5', 'Facultades'],
    ],
    proyectos: [],
  },
  {
    id: 'ufg',
    nombre: 'Universidad Francisco Gavidia (UFG)',
    sigla: 'UNIVERSIDAD FRANCISCO GAVIDIA',
    ubicacion: 'San Salvador, El Salvador',
    tipo: 'Private University',
    image: 'https://picsum.photos/seed/ufg/800/400',
    descripcion: 'Universidad con tradición de inclusión social y responsabilidad comunitaria en todas sus disciplinas.',
    estadisticas: [
      ['19', 'Proyectos activos'],
      ['103', 'Estudiantes asignados'],
      ['7', 'Facultades'],
    ],
    proyectos: [],
  },
  {
    id: 'ujmd',
    nombre: 'Universidad José Matías Delgado (UJMD)',
    sigla: 'UJMD',
    ubicacion: 'Antiguo Cuscatlán, El Salvador',
    tipo: 'Private University',
    image: 'https://picsum.photos/seed/ujmd/800/400',
    descripcion: 'Institución educativa pionera en innovación académica y compromiso con el desarrollo sostenible.',
    estadisticas: [
      ['20', 'Proyectos activos'],
      ['112', 'Estudiantes asignados'],
      ['8', 'Facultades'],
    ],
    proyectos: [],
  },
  {
    id: 'utec',
    nombre: 'Universidad Tecnológica (UTEC)',
    sigla: 'UTEC',
    ubicacion: 'San Salvador, El Salvador',
    tipo: 'Private University',
    image: 'https://picsum.photos/seed/utec/800/400',
    descripcion: 'Enfocada en educación tecnológica con vínculos directos con la industria y sector productivo.',
    estadisticas: [
      ['17', 'Proyectos activos'],
      ['89', 'Estudiantes asignados'],
      ['4', 'Facultades'],
    ],
    proyectos: [],
  },
  {
    id: 'uees',
    nombre: 'Universidad Evangelista de El Salvador (UEES)',
    sigla: 'UEES',
    ubicacion: 'La Libertad, El Salvador',
    tipo: 'Private University',
    image: 'https://picsum.photos/seed/uees/800/400',
    descripcion: 'Institución de educación superior con énfasis en valores y responsabilidad social universitaria.',
    estadisticas: [
      ['12', 'Proyectos activos'],
      ['67', 'Estudiantes asignados'],
      ['5', 'Facultades'],
    ],
    proyectos: [],
  },
  {
    id: 'unicaes',
    nombre: 'Universidad Católica de El Salvador (UNICAES)',
    sigla: 'UNICAES',
    ubicacion: 'San Salvador, El Salvador',
    tipo: 'Private University',
    image: 'https://picsum.photos/seed/unicaes/800/400',
    descripcion: 'Universidad con larga trayectoria en formación de profesionales comprometidos con la sociedad.',
    estadisticas: [
      ['21', 'Proyectos activos'],
      ['134', 'Estudiantes asignados'],
      ['9', 'Facultades'],
    ],
    proyectos: [],
  },
  {
    id: 'usan',
    nombre: 'Universidad de Santa Ana (USAN)',
    sigla: 'USAN',
    ubicacion: 'Santa Ana, El Salvador',
    tipo: 'Private University',
    image: 'https://picsum.photos/seed/usan/800/400',
    descripcion: 'Centro académico regional con fuerte presencia en programas de servicios comunitarios.',
    estadisticas: [
      ['14', 'Proyectos activos'],
      ['76', 'Estudiantes asignados'],
      ['6', 'Facultades'],
    ],
    proyectos: [],
  },
];

const proyectosEstudiantes: Array<{ titulo: string; facultad: string; ubicacion: string; estudiantes: Estudiante[] }> = [
  {
    titulo: 'Alfabetización digital para comunidades rurales',
    facultad: 'Educación',
    ubicacion: 'Chalatenango',
    estudiantes: [
      { nombre: 'Valeria Cruz', cargo: 'Líder del proyecto', carrera: 'Sociología', avatar: 'VC' },
      { nombre: 'Diego Flores', cargo: 'Desarrollador de plataforma', carrera: 'Informática', avatar: 'DF' },
      { nombre: 'Ana López', cargo: 'Diseñadora curricular', carrera: 'Educación', avatar: 'AL' },
    ],
  },
  {
    titulo: 'Prototipo de vivienda urbana sostenible',
    facultad: 'Arquitectura e Ingeniería',
    ubicacion: 'San Salvador',
    estudiantes: [
      { nombre: 'Mateo Rivera', cargo: 'Arquitecto líder', carrera: 'Arquitectura', avatar: 'MR' },
      { nombre: 'Sofía Méndez', cargo: 'Analista estructural', carrera: 'Ingeniería Civil', avatar: 'SM' },
    ],
  },
  {
    titulo: 'Acompañamiento de comercio electrónico',
    facultad: 'Administración y Economía',
    ubicacion: 'Santa Tecla',
    estudiantes: [
      { nombre: 'Camila Vargas', cargo: 'Estratega de marca', carrera: 'Mercadeo', avatar: 'CV' },
      { nombre: 'Andrés Morales', cargo: 'Asesor financiero', carrera: 'Administración', avatar: 'AM' },
      { nombre: 'Luis Méndez', cargo: 'Creador de contenido', carrera: 'Comunicación', avatar: 'LM' },
    ],
  },
];

const detalleProyecto = {
  titulo: 'Reforestación en Cerro Verde',
  estado: 'Activo' as EstadoProyecto,
  institucion: 'Universidad de El Salvador',
  ubicacion: 'Santa Ana, El Salvador',
  fechas: 'Ene 2024 - Dic 2024',
  desplegados: '4 estudiantes asignados',
  descripcion:
    'El proyecto de Reforestación en Cerro Verde busca restaurar la flora nativa en zonas degradadas del parque nacional. Los estudiantes trabajan con guardaparques y comunidades para plantar más de 5,000 árboles durante este año, mientras monitorean la salud del suelo y la recuperación de biodiversidad.\n\nLa iniciativa integra ciencia ambiental, vinculación comunitaria y logística sostenible para asegurar la supervivencia de los árboles sembrados. Los datos recopilados servirán para crear un modelo de predicción para futuras campañas de reforestación en El Salvador.',
  objetivos: ['Plantar 5,000 árboles', 'Educación comunitaria', 'Monitoreo del suelo', 'Levantamiento de biodiversidad'],
  equipo: [
    { nombre: 'Ana García', cargo: 'Líder del proyecto / Botánica', carrera: 'Biología', activo: true },
    { nombre: 'Carlos Méndez', cargo: 'Coordinador logístico', carrera: 'Administración', activo: false },
    { nombre: 'Sofía Rodríguez', cargo: 'Enlace comunitario', carrera: 'Sociología', activo: true },
    { nombre: 'Diego Torres', cargo: 'Analista de datos', carrera: 'Informática', activo: false },
  ],
};

const clasificacionEstado: Record<EstadoProyecto, string> = {
  Activo: 'active',
  'En planificación': 'planning',
  'En convocatoria': 'recruiting',
  Cerrado: 'closed',
};

function App() {
  const location = useLocation();
  const activePage = location.pathname.split('/')[1] || 'mapa';

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/mapa" replace />} />
      <Route path="/login/docente" element={<LoginPage tipo="docente" />} />
      <Route path="/login/estudiante" element={<LoginPage tipo="estudiante" />} />
      <Route path="/*" element={<Shell activePage={activePage} />} />
    </Routes>
  );
}

function Shell({ activePage }: { activePage: string }) {
  return (
    <div className="app-shell">
      <Header activePage={activePage} />
      <main>
        <Routes>
          <Route path="/mapa" element={<MapaVistaPage />} />
          <Route path="/instituciones" element={<InstitucionesPage />} />
          <Route path="/instituciones/:id" element={<InstitucionDetallePage />} />
          <Route path="/proyectos" element={<ProyectosPage />} />
          <Route path="/proyectos/:id" element={<ProyectoDetallePage />} />
          <Route path="/estudiantes" element={<EstudiantesPage />} />
          <Route path="*" element={<Navigate to="/mapa" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function Header({ activePage }: { activePage: string }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">
          <MapPinned size={20} strokeWidth={2.5} />
        </div>
        <span>El Salvador EduMap</span>
      </div>

      <nav className="topnav" aria-label="Navegación principal">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `topnav-link ${isActive || activePage === item.to.slice(1) ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="topbar-actions">
        <label className="searchbox">
          <Search size={18} />
          <input placeholder="Buscar..." aria-label="Buscar" />
        </label>
        <button className="avatar-button" aria-label="Abrir menú de cuenta">
          <span>AM</span>
        </button>
      </div>
    </header>
  );
}

function LoginPage({ tipo }: { tipo: 'docente' | 'estudiante' }) {
  const isDocente = tipo === 'docente';

  if (isDocente) {
    // Diseño para Docentes: Tarjeta centrada
    return (
      <div className="login-page employee-login">
        <div className="login-shell">
          <div className="login-card card-type-employee">
            <div className="login-strip" />
            <div className="login-icon">
              <Building2 size={40} />
            </div>
            <h1>Faculty & Staff Portal</h1>
            <p>Secure access for university employees.</p>

            <form className="login-form">
              <Field 
                label="Institutional Email" 
                placeholder="e.g. jdoe@uni.edu.sv" 
                icon={<Mail size={18} />} 
              />
              <Field 
                label="Password" 
                placeholder="••••••••" 
                icon={<Lock size={18} />} 
                suffix={<Eye size={18} />} 
                type="password" 
              />
              <label className="remember-row">
                <span className="check" />
                <span>Remember my device</span>
              </label>
              <button className="primary-btn large" type="button">
                <Layers3 size={18} />
                Login with Microsoft Account
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Diseño para Estudiantes: Dos columnas
  return (
    <div className="login-page student-login">
      <div className="login-split-container">
        <aside className="login-aside">
          <div className="login-aside-badge">Student</div>
          <h2 className="login-aside-title">Connect with your campus community</h2>
          <p className="login-aside-text">Join initiatives that make a real impact in El Salvador</p>
        </aside>

        <main className="login-main">
          <div className="login-card card-type-student">
            <div className="login-icon">
              <GraduationCap size={40} />
            </div>
            <h1>Welcome back</h1>
            <p>Please enter your student credentials to continue.</p>

            <form className="login-form">
              <Field 
                label="Student Email or ID" 
                placeholder="e.g. student@uni.edu.sv" 
                icon={<Mail size={18} />} 
              />
              <Field 
                label="Password" 
                placeholder="••••••••" 
                icon={<Lock size={18} />} 
                suffix={<Eye size={18} />} 
                type="password" 
              />
              <button className="primary-btn large" type="button">
                Sign In
              </button>

              <div className="login-divider">OR CONTINUE WITH</div>

              <button className="microsoft-btn" type="button">
                <Layers3 size={18} />
                University Microsoft Account
              </button>
            </form>

            <p className="login-footer-text">
              Don't have an account? <Link to="#" className="text-link">Contact Admissions</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function MapaVistaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const proyectoId = searchParams.get('proyecto') ?? 'cerro-verde';
  const proyectoSeleccionado = proyectosMapa.find((item) => item.id === proyectoId) ?? proyectosMapa[0];
  const mostrarDetalle = searchParams.has('proyecto');

  const focoMapa = proyectoSeleccionado.id === 'cerro-verde' ? '56% 48%' : proyectoSeleccionado.id === 'alfabetizacion-digital' ? '67% 40%' : proyectoSeleccionado.id === 'paneles-solares' ? '82% 68%' : '47% 55%';

  return (
    <div className="dashboard-grid map-layout">
      <aside className="sidebar map-sidebar">
        {!mostrarDetalle ? (
          <div className="projects-list-container">
            <div className="section-header">
              <h2 className="sidebar-title">Proyectos activos</h2>
              <div className="icon-group">
                <button className="icon-btn" aria-label="Filtrar proyectos">
                  <Filter size={18} />
                </button>
                <button className="icon-btn" aria-label="Ajustar vista">
                  <SlidersHorizontal size={18} />
                </button>
              </div>
            </div>

            <div className="stack-list cards-scroll sidebar-projects-list">
              {proyectosMapa.map((project) => (
                <article className="project-summary-card" key={project.id}>
                  <div className="project-summary-topline">{project.institucion}</div>
                  <div className={`pill status ${clasificacionEstado[project.estado]}`}>{project.estado}</div>
                  <h3>{project.titulo}</h3>
                  <p className="muted with-icon">
                    <MapPinned size={15} />
                    {project.ubicacion}
                  </p>
                  <p className="summary-copy">{project.resumen}</p>
                  <div className="avatar-row">
                    <AvatarGroup count={project.personas} />
                    <button className="text-link link-button" type="button" onClick={() => setSearchParams({ proyecto: project.id })}>
                      Ver detalles
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <ProjectMapDetail
            project={proyectoSeleccionado}
            onReset={() => setSearchParams({})}
          />
        )}
      </aside>

      <section className="map-panel">
        <div className="map-toolbar">
          <div className="legend-pill">
            <span className="legend men" /> Hombres
            <span className="legend women" /> Mujeres
          </div>
          <button className="mini-chip" onClick={() => setSearchParams({ proyecto: proyectoSeleccionado.id })}>
            Centrar mapa
          </button>
        </div>
        <div className={`map-scene ${mostrarDetalle ? 'focused' : ''}`} style={{ transformOrigin: focoMapa }}>
          {marcadoresMapa.map((marker) => {
            const activo = marker.id === proyectoSeleccionado.id;
            return (
              <div
                className={`map-marker ${activo ? 'active' : ''}`}
                key={marker.label}
                style={{ top: `${marker.top}%`, left: `${marker.left}%`, transform: activo ? 'translate(-50%, -50%) scale(1.08)' : 'translate(-50%, -50%)' }}
              >
                <div className="map-department-label">
                  <div className="map-marker-title">{marker.label}</div>
                  <div className="label-counts">
                    <span className="count-pill-blue">
                      <Users size={13} /> {marker.hombres}
                    </span>
                    <span className="count-pill-pink">
                      <Users size={13} /> {marker.mujeres}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="map-zoom">
            <button type="button">+</button>
            <button type="button">−</button>
          </div>
          <div className="map-reset-floating">
            <button className="secondary-btn" type="button" onClick={() => setSearchParams({})}>
              <ChevronLeft size={18} />
              Restablecer mapa
            </button>
          </div>
          <div className="map-overlay-note">Desplaza la vista con el detalle seleccionado para acercar la zona del proyecto.</div>
          <div className="map-focus-indicator" style={{ inset: 'auto auto 22% 44%' }} />
        </div>
      </section>
    </div>
  );
}

function ProjectMapDetail({ project, onReset }: { project: (typeof proyectosMapa)[number]; onReset: () => void }) {
  const teamRoles = ['Líder del proyecto', 'Logística', 'Enlace comunitario', 'Apoyo académico'];
  const projectImage = project.imagen ?? '/images/ProjectsDirectoryDetailedView.jpeg';

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
          <div className="project-detail-hero">
            <img src={projectImage} alt={project.titulo} className="project-main-img" />
          </div>

          <div className="detail-body">
            <span className="inst-name">UNIVERSIDAD DE EL SALVADOR</span>
            <h2 className="detail-title">{project.titulo}</h2>

            <div className="detail-meta">
              <p><MapPinned size={14} /> {project.ubicacion}</p>
              <p><CalendarDays size={14} /> Ene 2024 - Dic 2024</p>
              <p><Users size={14} /> {project.personas} estudiantes asignados</p>
            </div>

            <div className="detail-description">
              <h3>Acerca del proyecto</h3>
              <p>{project.resumen}</p>
            </div>

            <div className="team-section">
              <div className="team-header">
                <h3>Equipo del proyecto</h3>
                <button className="link-btn" type="button">Ver todo</button>
              </div>
              <div className="team-list">
                {project.equipo.map((member, index) => {
                  const initials = member
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div className="team-card" key={member}>
                      <div className="avatar-circle">{initials}</div>
                      <div className="member-info">
                        <p className="member-name">{member}</p>
                        <p className="member-role">{teamRoles[index] ?? 'Colaborador'}</p>
                      </div>
                      <MessageSquare size={18} className="contact-icon" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProyectoDetallePage() {
  const { id = '' } = useParams();
  let project = proyectosMapa.find((item) => item.id === id);
  if (!project) {
    const found = instituciones.flatMap((i) => i.proyectos).find((p) => p.id === id);
    if (found) {
      project = { ...found, resumen: found.descripcion, personas: 3 } as any;
    }
  }
  if (!project) project = proyectosMapa[0];

  return (
    <div className="detail-page wide-page">
      <BackLink to="/proyectos" label="Volver a proyectos" />

      <div className="project-detail-hero">
        <img src={`/images/${project.id}.jpg`} alt={project.titulo} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22300%22%3E%3Crect fill=%22%238db179%22 width=%22600%22 height=%22300%22/%3E%3C/svg%3E'; }} />
        <div className="project-detail-hero-content">
          <div className="project-detail-hero-topline">
            <span className={`pill status ${clasificacionEstado[project.estado]}`}>{project.estado}</span>
            <span>{project.institucion}</span>
            <span className="dot">•</span>
            <span>{project.ubicacion}</span>
          </div>
          <h1>{project.titulo}</h1>
        </div>
      </div>

      <div className="project-detail-body">
        <section className="detail-main">
          <div className="detail-section">
            <h2>About the Project</h2>
            <p>{project.descripcion}</p>
          </div>

          <div className="detail-section">
            <h2>Key Objectives</h2>
            <div className="objectives-list">
              <div className="objective-card">
                <div className="objective-index">1</div>
                <div>
                  <h3>Plant 5,000 Trees</h3>
                  <p>Focusing on native species to restore the local ecosystem.</p>
                </div>
              </div>
              <div className="objective-card">
                <div className="objective-index">2</div>
                <div>
                  <h3>Community Education</h3>
                  <p>Workshops with local schools on conservation.</p>
                </div>
              </div>
              <div className="objective-card">
                <div className="objective-index">3</div>
                <div>
                  <h3>Soil Monitoring</h3>
                  <p>Track pH levels, moisture, and nutrient content monthly.</p>
                </div>
              </div>
              <div className="objective-card">
                <div className="objective-index">4</div>
                <div>
                  <h3>Biodiversity Survey</h3>
                  <p>Log return of insect and bird species in target zones.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="detail-sidebar">
          <div className="detail-meta-card">
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>Project Team</h3>
            <div className="team-grid" style={{ gridTemplateColumns: '1fr' }}>
              {project.equipo && project.equipo.length > 0 ? (
                project.equipo.map((name) => (
                  <div key={name} className="team-member-card" style={{ flexDirection: 'row', padding: '12px' }}>
                    <div className="member-avatar" style={{ width: '40px', height: '40px' }}>
                      {name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 2px', fontSize: '0.95rem' }}>{name}</h4>
                      <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>Role here</p>
                    </div>
                    <button className="icon-btn" style={{ padding: 0, width: 'auto', color: '#2d63e2' }}>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="muted">No team info available</p>
              )}
            </div>
            <button className="text-link" style={{ marginTop: '12px', width: '100%', textAlign: 'center' }}>
              View Full Team Directory
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ProyectosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const modalNuevo = searchParams.get('nuevo') === '1';
  const [selectedFaculty, setSelectedFaculty] = useState('Todas las facultades');

  const facultyToMajors: Record<string, string[]> = {
    'Todas las facultades': [],
    'Arquitectura e Ingeniería': ['Ingeniería', 'Arquitectura', 'Electrónica'],
    'Ciencias sociales y humanidades': ['Sociología', 'Historia', 'Psicología'],
    'Comunicación y mercadeo': ['Mercadeo', 'Comunicación'],
    'Derecho': ['Derecho'],
    'Diseño': ['Diseño Gráfico', 'Diseño'],
    'Educación': ['Educación'],
    'Administración': ['Administración', 'Gestión'],
  };

  const allProjects = instituciones.flatMap((institution) => institution.proyectos);
  const filteredProjects = selectedFaculty === 'Todas las facultades'
    ? allProjects
    : allProjects.filter((p) => p.carreras.some((c) => facultyToMajors[selectedFaculty]?.includes(c)));

  return (
    <div className={`directory-page wide-page ${modalNuevo ? 'modal-open' : ''}`}>
      <PageHero
        eyebrow="Proyectos disponibles"
        title="Encuentra proyectos según tu carrera o colabora con otras áreas."
        description="Postúlate y participa en iniciativas de impacto social en todo El Salvador."
        action={
          <button className="primary-btn rounded-icon" type="button" onClick={() => setSearchParams({ nuevo: '1' })} title="Crear nuevo proyecto">
            <Plus size={24} />
        </button>
        }
      />

      <div className="chip-row">
        {['Todas las facultades', 'Arquitectura e Ingeniería', 'Ciencias sociales y humanidades', 'Comunicación y mercadeo', 'Derecho', 'Diseño', 'Educación', 'Administración'].map((chip) => (
          <button key={chip} className={chip === selectedFaculty ? 'chip active' : 'chip'} type="button" onClick={() => setSelectedFaculty(chip)}>
            {chip}
          </button>
        ))}
      </div>

      <div className="content-split">
        <aside className="filter-rail">
          <SearchPanel title="Búsqueda" placeholder="Palabras clave..." />
          <FilterGroup title="Estado" options={['En convocatoria', 'Activo', 'Cerrado']} />
          <FilterGroup title="Ubicación" options={['San Salvador', 'Santa Ana', 'San Miguel', 'La Libertad', 'Chalatenango']} />
        </aside>

        <section className="list-panel">
          <div className="list-meta">
            <span>Mostrando <strong>124</strong> proyectos</span>
            <span>Ordenar por: <strong>Más recientes</strong></span>
          </div>

          <div className="project-feed">
            {filteredProjects.map((project) => (
              <ProjectListCard key={project.id} project={project} />
            ))}
          </div>

          <div className="center-actions">
            <button className="secondary-btn load-more-btn" type="button">
              <span className="spin-dot" />
              Cargar más proyectos
            </button>
          </div>
        </section>
      </div>

      {modalNuevo ? <CreateProjectModal onClose={() => setSearchParams({})} /> : null}
    </div>
  );
}


function InstitucionDetallePage() {
  const { id = 'ues' } = useParams();
  const institution = instituciones.find((item) => item.id === id) ?? instituciones[0];

  return (
    <div className="detail-page wide-page">
      <BackLink to="/instituciones" label="Volver a instituciones" />

      <section className="institution-hero">
        <div className="checker-bg" />
        {/* removed duplicate decorative float to avoid double blue shapes */}
        <div className="institution-header-row">
          <div className="floating-logo" />
          <div className="institution-meta">
            <span className="eyebrow-tag">Universidad destacada</span>
            <span className="muted">{institution.ubicacion}</span>
            <h1>{institution.nombre}</h1>
            <p>{institution.descripcion}</p>
          </div>
        </div>
        <div className="stats-row">
          {institution.estadisticas.map(([value, label]) => (
            <div key={label} className="stat-block">
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs with local state to switch content without overlapping layout */}
      <InstitutionTabs institution={institution} />
    </div>
  );
}

function InstitutionTabs({ institution }: { institution: (typeof instituciones)[number] }) {
  const [tab, setTab] = useState<'general'|'projects'|'past'|'students'>('projects');

  const proyectos = institution.proyectos ?? [];
  const proyectosPasados = proyectos.filter((p: any) => p.estado === 'Cerrado' || p.estado === 'Pasado');

  return (
    <>
      <div className="tabs-row">
        <button className={`tab ${tab === 'general' ? 'active' : ''}`} type="button" onClick={() => setTab('general')}>General</button>
        <button className={`tab ${tab === 'projects' ? 'active' : ''}`} type="button" onClick={() => setTab('projects')}>Proyectos activos</button>
        <button className={`tab ${tab === 'past' ? 'active' : ''}`} type="button" onClick={() => setTab('past')}>Proyectos pasados</button>
        <button className={`tab ${tab === 'students' ? 'active' : ''}`} type="button" onClick={() => setTab('students')}>Estudiantes</button>
      </div>

      <div className="institution-content">
        <section className="projects-zone" style={{ display: tab === 'projects' ? 'block' : 'none' }}>
          <div className="section-heading-row">
            <h2>Iniciativas actuales</h2>
            <div className="inline-tools">
              <SearchPanel title="" placeholder={`Buscar proyectos de ${institution.sigla?.split(' ')[0] ?? ''}...`} compact />
              <button className="secondary-btn" type="button">Filtrar</button>
            </div>
          </div>

          <div className="institution-project-grid">
            {proyectos.length ? proyectos.map((project: any) => (
              <ProjectCompactCard key={project.id} project={project} />
            )) : <p>No hay proyectos activos.</p>}
          </div>
        </section>

        <section className="projects-zone" style={{ display: tab === 'past' ? 'block' : 'none' }}>
          <div className="section-heading-row">
            <h2>Proyectos pasados</h2>
          </div>
          <div className="institution-project-grid">
            {proyectosPasados.length ? proyectosPasados.map((project: any) => (
              <ProjectCompactCard key={project.id} project={project} />
            )) : <p>No hay proyectos pasados.</p>}
          </div>
        </section>

        <section style={{ display: tab === 'general' ? 'block' : 'none' }}>
          <div className="section-heading-row">
            <h2>General</h2>
          </div>
          <p>{institution.descripcion}</p>
        </section>

        <section style={{ display: tab === 'students' ? 'block' : 'none' }}>
          <div className="section-heading-row">
            <h2>Estudiantes</h2>
          </div>
          <p>Listado de estudiantes asignados (si aplica).</p>
        </section>

      </div>
    </>
  );
}

function SearchPanel({ title, placeholder, compact = false }: { title: string; placeholder: string; compact?: boolean }) {
  return (
    <div className={`search-panel ${compact ? 'compact' : ''}`}>
      {title ? <h3>{title}</h3> : null}
      <div className="search-field">
        <Search size={16} />
        <input type="text" placeholder={placeholder} />
      </div>
    </div>
  );
}

function FilterGroup({ title, options, selected, onChange }: { title: string; options: string[]; selected?: string; onChange?: (opt: string) => void }) {
  const [localSelected, setLocalSelected] = useState<string | null>(selected ?? null);

  useEffect(() => {
    if (selected !== undefined) setLocalSelected(selected);
  }, [selected]);

  function handleSelect(opt: string) {
    if (onChange) onChange(opt);
    else setLocalSelected(opt);
  }

  const current = selected !== undefined ? selected : localSelected;

  return (
    <div className="filter-group">
      <h3>{title}</h3>
      <div className="filter-options">
        {options.map((option) => (
          <button
            key={option}
            className={`filter-option ${current === option ? 'active' : ''}`}
            type="button"
            onClick={() => handleSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function EstudiantesPage() {
  return (
    <div className="students-page wide-page">
      <div className="students-topline">
        <span className="eyebrow-tag">Universidad Centroamericana (UCA)</span>
        <button className="secondary-btn logout-btn" type="button">
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
      <PageHero
        title="Estudiantes por proyecto"
        description="Consulta qué estudiantes de la UCA participan en cada iniciativa activa y conoce sus equipos de trabajo."
      />

      <div className="content-split students-layout">
        <aside className="filter-rail">
          <SearchPanel title="Búsqueda" placeholder="Estudiante o proyecto..." />
          <FilterGroup title="Filtrar por facultad" options={['Arquitectura e Ingeniería', 'Ciencias sociales y humanidades', 'Comunicación y mercadeo', 'Derecho', 'Diseño', 'Educación', 'Administración y Economía']} />
          <FilterGroup title="Ubicación del proyecto" options={['San Salvador', 'Chalatenango', 'Santa Tecla', 'San Miguel']} />
        </aside>

        <section className="list-panel project-team-feed">
          {proyectosEstudiantes.map((project) => (
            <article className="student-project-card" key={project.titulo}>
              <div className="student-project-header">
                <div>
                  <h3>{project.titulo}</h3>
                  <p className="muted with-icon">
                    <GraduationCap size={15} />
                    {project.facultad} <span className="dot">•</span> {project.ubicacion}
                  </p>
                </div>
                <Link to={`/proyectos/${project.titulo.toLowerCase().replace(/\s+/g, '-')}`} className="text-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  View Project Details
                  <ArrowRight size={18} />
                </Link>
              </div>

              <div className="team-label">PROJECT TEAM MEMBERS ({project.estudiantes.length})</div>
              <div className="student-grid-horizontal">
                {project.estudiantes.map((student) => (
                  <div key={student.nombre} className="student-card-horizontal">
                    <div className="student-avatar">{student.avatar}</div>
                    <div className="student-info">
                      <h4>{student.nombre}</h4>
                      <p className="role-link">{student.cargo}</p>
                      <span className="muted small">{student.carrera}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}

          <div className="center-actions">
            <button className="secondary-btn load-more-btn" type="button">
              <span className="spin-dot" />
              Load More Projects
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function InstitucionesPage() {
  const [activeFilter, setActiveFilter] = useState(0);
  const categorias = ['Todos', 'Universidades Públicas', 'Universidades Privadas', 'Escuelas Técnicas', 'Institutos Especializados'];
  // Imágenes locales para rotar en las cards
  const institutionImages = [
    'InstitutionDetailView.jpeg',
    'InstitutionDetailViewCopy.jpeg',
    'InstitutionsDirectory.jpeg',
    'ProjectsDirectoryDetailedView.jpeg',
    'MainMapDashboard.jpeg',
    'EmployeeLogin.jpeg',
    'StudentLogin.jpeg',
    'StudentsbyProject.jpeg',
    'StudentProjectDetail.jpeg',
    'InstitutionDetailView.jpeg',
  ];

  return (
    <div className="directory-page wide-page">
      {/* Sección del Título y Buscador */}
      <div className="page-header-top">
        <div className="title-section">
          <h1 className="main-title">Instituciones Aliadas</h1>
          <p className="main-description">
            Explora universidades, escuelas técnicas e institutos de todo El Salvador que 
            participan en iniciativas de proyectos estudiantiles.
          </p>
        </div>

        <div className="actions-section">
          <div className="search-wrapper">
            <Search size={18} className="search-icon-inside" />
            <input type="text" placeholder="Buscar instituciones..." />
          </div>
          <button className="filter-action-btn">
            <Filter size={16} />
            <span>Filtrar</span>
          </button>
          <button className="filter-action-btn">
            <SlidersHorizontal size={16} />
            <span>Ordenar</span>
          </button>
        </div>
      </div>

      {/* Filtros tipo Pill */}
      <div className="filter-pills-container">
        {categorias.map((cat, index) => (
          <button
            key={cat}
            className={`filter-pill ${index === activeFilter ? 'active' : ''}`}
            onClick={() => setActiveFilter(index)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Cards */}
      <div className="institution-grid">
        {instituciones.map((inst, i) => {
          const imageSrc = `/images/${institutionImages[i % institutionImages.length]}`;
          return (
            <Link key={inst.id} to={`/instituciones/${inst.id}`} className="institution-card-link">
              <InstitutionCard institution={inst} imageUrl={imageSrc} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function CreateProjectModal({ onClose }: { onClose: () => void }) {
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

        <Field label="Descripción del proyecto" placeholder="Describe los objetivos e impacto del proyecto..." textarea />

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

function ProjectListCard({ project }: { project: Proyecto }) {
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
            <span key={major} className="major-pill">{major}</span>
          ))}
        </div>
      </div>
      <div className="project-list-stats">
        <div>
          <span>Fecha límite</span>
          <strong>{project.fechaLimite ?? '15 oct 2024'}</strong>
        </div>
        <div>
          <span>Cupos disponibles</span>
          <strong>{project.cupos ?? '0 / 5'}</strong>
        </div>
        <div className="closed-box">Inscripciones cerradas</div>
        <Link className="text-link project-details-link" to={`/proyectos/${project.id}`}>
          Ver detalles
        </Link>
      </div>
    </article>
  );
}

function ProjectCompactCard({ project }: { project: Proyecto }) {
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

function AvatarGroup({ count }: { count: number }) {
  const labels = ['AA', 'CM', 'SR'];
  return (
    <div className="avatars">
      {labels.slice(0, Math.min(count, 3)).map((label, index) => (
        <span key={label} className="avatar-stack" style={{ transform: `translateX(${index * -8}px)` }}>
          {label}
        </span>
      ))}
      <span className="avatar-count" style={{ transform: `translateX(${Math.min(count, 3) * -8}px)` }}>
        +{count > 3 ? count - 3 : count}
      </span>
    </div>
  );
}

function PageHero({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return (
    <section className="page-hero">
      {eyebrow ? <span className="eyebrow-tag">{eyebrow}</span> : null}
      <div className="hero-copy-row">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {action ? <div className="hero-action">{action}</div> : null}
      </div>
    </section>
  );
}

function Field({
  label,
  placeholder,
  icon,
  suffix,
  type = 'text',
  textarea = false,
}: {
  label: string;
  placeholder: string;
  icon?: ReactNode;
  suffix?: ReactNode;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="field-input">
        {icon ? <span className="field-icon">{icon}</span> : null}
        {textarea ? <textarea placeholder={placeholder} rows={5} /> : <input type={type} placeholder={placeholder} />}
        {suffix ? <span className="field-suffix">{suffix}</span> : null}
      </div>
    </label>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link className="back-link" to={to}>
      <ChevronLeft size={16} />
      <span>{label}</span>
    </Link>
  );
}

export default App;