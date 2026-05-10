import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import {
  Download, FileSpreadsheet, Users, BookOpen,
  Building2, MapPin, GraduationCap, ChevronDown, UserCheck,
} from 'lucide-react';
import { instituciones } from '../data/instituciones';
import { marcadoresMapa } from '../data/proyectos';

// ─── Paleta de colores ────────────────────────────────────────────────────────
const C = {
  blue:   '#2f68ec',
  green:  '#21c08a',
  pink:   '#d9488f',
  yellow: '#f5a623',
  purple: '#7c5cbf',
  teal:   '#14b8a6',
  orange: '#f97316',
  red:    '#ef4444',
};
const PALETTE = [C.blue, C.green, C.pink, C.purple, C.yellow, C.teal, C.orange, C.red];

// ─── Datos estáticos enriquecidos ─────────────────────────────────────────────

// Req 1 — Alumnos por carrera y año haciendo horas sociales
const alumnosPorCarreraAnio = [
  { carrera: 'Medicina',         '2022': 18, '2023': 24, '2024': 31 },
  { carrera: 'Ingeniería Civil', '2022': 14, '2023': 20, '2024': 27 },
  { carrera: 'Educación',        '2022': 22, '2023': 28, '2024': 35 },
  { carrera: 'Informática',      '2022': 10, '2023': 16, '2024': 22 },
  { carrera: 'Agronomía',        '2022':  8, '2023': 12, '2024': 18 },
  { carrera: 'Psicología',       '2022': 12, '2023': 19, '2024': 24 },
  { carrera: 'Derecho',          '2022':  9, '2023': 14, '2024': 20 },
  { carrera: 'Biología',         '2022':  7, '2023': 11, '2024': 16 },
];

// Req 3 — Estudiantes por municipio
const estudiantesPorMunicipio = [
  { municipio: 'San Salvador',  estudiantes: 142 },
  { municipio: 'Santa Ana',     estudiantes: 87  },
  { municipio: 'San Miguel',    estudiantes: 65  },
  { municipio: 'Santa Tecla',   estudiantes: 58  },
  { municipio: 'La Libertad',   estudiantes: 43  },
  { municipio: 'Chalatenango',  estudiantes: 34  },
  { municipio: 'Soyapango',     estudiantes: 29  },
  { municipio: 'Usulután',      estudiantes: 22  },
  { municipio: 'Cojutepeque',   estudiantes: 18  },
  { municipio: 'Zacatecoluca',  estudiantes: 15  },
];

// Req 4 — Proyectos por municipio
const proyectosPorMunicipio = [
  { municipio: 'San Salvador',  proyectos: 18, activos: 12 },
  { municipio: 'Santa Ana',     proyectos: 11, activos:  7 },
  { municipio: 'San Miguel',    proyectos:  9, activos:  6 },
  { municipio: 'Santa Tecla',   proyectos:  8, activos:  5 },
  { municipio: 'La Libertad',   proyectos:  6, activos:  4 },
  { municipio: 'Chalatenango',  proyectos:  5, activos:  3 },
  { municipio: 'Soyapango',     proyectos:  4, activos:  3 },
  { municipio: 'Usulután',      proyectos:  3, activos:  2 },
];

// ─── Hook de métricas derivadas ───────────────────────────────────────────────
function useMetrics() {
  return useMemo(() => {
    const allProjects = instituciones.flatMap((i) => i.proyectos);

    // Req 6 — Total de estudiantes en servicio social externo
    const totalEstudiantesExterno = instituciones.reduce((sum, i) => {
      return sum + parseInt(i.estadisticas.find(([, l]) => l.includes('Estudiantes'))?.[0] ?? '0', 10);
    }, 0);

    const totalProyectos     = allProjects.length;
    const totalInstituciones = instituciones.length;
    const totalMunicipios    = proyectosPorMunicipio.length;

    // Req 2 — Hombres y mujeres haciendo horas sociales
    const totalHombres = marcadoresMapa.reduce((s, m) => s + m.hombres, 0);
    const totalMujeres = marcadoresMapa.reduce((s, m) => s + m.mujeres, 0);
    const generoData   = [
      { name: 'Hombres', value: totalHombres },
      { name: 'Mujeres', value: totalMujeres },
    ];

    // Req 5 — Métricas de proyectos por institución
    const metricasPorInstitucion = instituciones.map((i) => ({
      nombre:      i.sigla.split(' ')[0],
      nombreFull:  i.nombre,
      tipo:        i.tipo?.includes('Public') ? 'Pública' : 'Privada',
      ubicacion:   i.ubicacion,
      total:       i.proyectos.length,
      activos:     i.proyectos.filter((p) => p.estado === 'Activo').length,
      convocados:  i.proyectos.filter((p) => p.estado === 'En convocatoria').length,
      planif:      i.proyectos.filter((p) => p.estado === 'En planificación').length,
      estudiantes: parseInt(i.estadisticas.find(([, l]) => l.includes('Estudiantes'))?.[0] ?? '0', 10),
      facultades:  parseInt(i.estadisticas.find(([, l]) => l.includes('Facultades'))?.[0] ?? '0', 10),
    })).sort((a, b) => b.total - a.total);

    // Tendencia histórica para contextualizar el total de externos
    const tendenciaAnual = [
      { anio: '2020', estudiantes: 210, proyectos: 28 },
      { anio: '2021', estudiantes: 285, proyectos: 37 },
      { anio: '2022', estudiantes: 364, proyectos: 49 },
      { anio: '2023', estudiantes: 498, proyectos: 64 },
      { anio: '2024', estudiantes: totalEstudiantesExterno, proyectos: totalProyectos },
    ];

    return {
      totalEstudiantesExterno, totalProyectos, totalInstituciones,
      totalMunicipios, totalHombres, totalMujeres,
      generoData, metricasPorInstitucion, tendenciaAnual,
    };
  }, []);
}

// ─── Exportar CSV ─────────────────────────────────────────────────────────────
function exportToExcel(metrics: ReturnType<typeof useMetrics>) {
  const sheets = [
    {
      name: 'Resumen General',
      rows: [
        ['Métrica', 'Valor'],
        ['Total Estudiantes en Servicio Social Externo', metrics.totalEstudiantesExterno],
        ['Total Proyectos', metrics.totalProyectos],
        ['Total Instituciones', metrics.totalInstituciones],
        ['Municipios con Proyectos', metrics.totalMunicipios],
        ['Estudiantes Hombres', metrics.totalHombres],
        ['Estudiantes Mujeres', metrics.totalMujeres],
      ],
    },
    {
      name: 'Alumnos por Carrera y Año',
      rows: [
        ['Carrera', '2022', '2023', '2024'],
        ...alumnosPorCarreraAnio.map((d) => [d.carrera, d['2022'], d['2023'], d['2024']]),
      ],
    },
    {
      name: 'Estudiantes por Municipio',
      rows: [['Municipio', 'Estudiantes'], ...estudiantesPorMunicipio.map((d) => [d.municipio, d.estudiantes])],
    },
    {
      name: 'Proyectos por Municipio',
      rows: [['Municipio', 'Total Proyectos', 'Activos'], ...proyectosPorMunicipio.map((d) => [d.municipio, d.proyectos, d.activos])],
    },
    {
      name: 'Métricas por Institución',
      rows: [
        ['Institución', 'Tipo', 'Ubicación', 'Total Proyectos', 'Activos', 'En convocatoria', 'En planificación', 'Estudiantes', 'Facultades'],
        ...metrics.metricasPorInstitucion.map((d) => [
          d.nombreFull, d.tipo, d.ubicacion, d.total, d.activos, d.convocados, d.planif, d.estudiantes, d.facultades,
        ]),
      ],
    },
    {
      name: 'Tendencia Anual',
      rows: [
        ['Año', 'Estudiantes Externos', 'Proyectos'],
        ...metrics.tendenciaAnual.map((d) => [d.anio, d.estudiantes, d.proyectos]),
      ],
    },
  ];

  let csv = '\uFEFF'; // BOM para compatibilidad con Excel
  sheets.forEach((s) => {
    csv += `\n=== ${s.name} ===\n`;
    s.rows.forEach((r) => { csv += r.join(',') + '\n'; });
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `EduMap_Dashboard_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="dash-kpi-card" style={{ '--kpi-color': color } as React.CSSProperties}>
      <div className="dash-kpi-icon">{icon}</div>
      <div className="dash-kpi-body">
        <span className="dash-kpi-label">{label}</span>
        <strong className="dash-kpi-value">{value}</strong>
        {sub && <span className="dash-kpi-sub">{sub}</span>}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, className = '' }: {
  title: string; subtitle?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`dash-chart-card ${className}`}>
      <div className="dash-chart-header">
        <h3 className="dash-chart-title">{title}</h3>
        {subtitle && <p className="dash-chart-subtitle">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="dash-tooltip">
      {label && <p className="dash-tooltip-label">{label}</p>}
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color, margin: '2px 0' }}>
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  );
};

// Req 1 — Gráfico con selector de año
function CarrerasChart() {
  const [anio, setAnio] = useState<'2022' | '2023' | '2024'>('2024');
  const data = alumnosPorCarreraAnio
    .map((d) => ({ carrera: d.carrera, alumnos: d[anio] }))
    .sort((a, b) => b.alumnos - a.alumnos);

  return (
    <ChartCard
      title="Alumnos en Horas Sociales por Carrera y Año"
      subtitle="Número de estudiantes realizando horas sociales, filtrando por año académico"
    >
      <div className="dash-year-selector">
        {(['2022', '2023', '2024'] as const).map((y) => (
          <button key={y} type="button" className={`dash-year-btn ${anio === y ? 'active' : ''}`} onClick={() => setAnio(y)}>
            {y}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, left: 96, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="carrera" tick={{ fontSize: 11 }} width={96} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="alumnos" name="Alumnos" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const metrics   = useMetrics();
  const [exportOpen, setExportOpen] = useState(false);
  const pctH = Math.round(metrics.totalHombres / (metrics.totalHombres + metrics.totalMujeres) * 100);
  const pctM = 100 - pctH;

  return (
    <div className="dashboard-page wide-page">

      {/* Encabezado */}
      <div className="dash-header">
        <div>
          <span className="eyebrow-tag">Métricas institucionales</span>
          <h1>Dashboard de Servicio Social</h1>
          <p className="dash-subtitle">
            Indicadores de participación estudiantil y proyectos activos en El Salvador — Actualizado 2024
          </p>
        </div>
        <div className="dash-export-group">
          <div className="dash-export-wrapper">
            <button className="primary-btn" type="button" onClick={() => setExportOpen((o) => !o)}>
              <Download size={16} /> Exportar <ChevronDown size={14} />
            </button>
            {exportOpen && (
              <div className="dash-export-dropdown">
                <button type="button" onClick={() => { window.print(); setExportOpen(false); }}>
                  <Download size={15} /> Exportar como PDF
                </button>
                <button type="button" onClick={() => { exportToExcel(metrics); setExportOpen(false); }}>
                  <FileSpreadsheet size={15} /> Exportar como Excel (CSV)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPIs — incluye el total de externos (Req 6) y el desglose de género (Req 2) */}
      <div className="dash-kpi-grid">
        <KpiCard icon={<UserCheck size={22} />}     label="Estudiantes en Servicio Social Externo" value={metrics.totalEstudiantesExterno} sub="Total activos 2024"        color={C.blue}   />
        <KpiCard icon={<BookOpen size={22} />}      label="Proyectos Totales"                       value={metrics.totalProyectos}          sub="Todas las instituciones"  color={C.green}  />
        <KpiCard icon={<Building2 size={22} />}     label="Instituciones Aliadas"                   value={metrics.totalInstituciones}      sub="Públicas y privadas"      color={C.purple} />
        <KpiCard icon={<MapPin size={22} />}        label="Municipios con Proyectos"                value={metrics.totalMunicipios}         sub="Cobertura nacional"       color={C.teal}   />
        <KpiCard icon={<Users size={22} />}         label="Hombres en Servicio Social"              value={metrics.totalHombres}            sub={`${pctH}% del total`}     color={C.blue}   />
        <KpiCard icon={<GraduationCap size={22} />} label="Mujeres en Servicio Social"              value={metrics.totalMujeres}            sub={`${pctM}% del total`}     color={C.pink}   />
      </div>

      {/* Req 1 — Alumnos por carrera y año */}
      <CarrerasChart />

      {/* Req 2 — Género + Tendencia anual */}
      <div className="dash-grid-2">
        <ChartCard title="Hombres y Mujeres en Horas Sociales" subtitle="Distribución por género de los estudiantes en servicio social externo">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={metrics.generoData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value">
                <Cell fill={C.blue} />
                <Cell fill={C.pink} />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="dash-gender-bar">
            <div className="dash-gender-segment men"   style={{ width: `${pctH}%` }}><span>{pctH}% H</span></div>
            <div className="dash-gender-segment women" style={{ width: `${pctM}%` }}><span>{pctM}% M</span></div>
          </div>
        </ChartCard>

        <ChartCard title="Tendencia Anual de Estudiantes Externos" subtitle="Evolución histórica de la participación en servicio social por año">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={metrics.tendenciaAnual} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="anio" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left"  tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line yAxisId="left"  type="monotone" dataKey="estudiantes" name="Estudiantes" stroke={C.blue}  strokeWidth={2.5} dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="proyectos"   name="Proyectos"   stroke={C.green} strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Req 3 — Estudiantes por municipio */}
      <ChartCard title="Número de Estudiantes por Municipio" subtitle="Distribución de estudiantes en servicio social externo según municipio de ejecución del proyecto">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={estudiantesPorMunicipio} margin={{ top: 4, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="municipio" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={48} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="estudiantes" name="Estudiantes" radius={[6, 6, 0, 0]}>
              {estudiantesPorMunicipio.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Req 4 — Proyectos por municipio */}
      <ChartCard title="Número de Proyectos por Municipio" subtitle="Total de proyectos registrados versus proyectos actualmente activos por municipio">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={proyectosPorMunicipio} margin={{ top: 4, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="municipio" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={48} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="proyectos" name="Total Proyectos" fill={C.purple} radius={[6, 6, 0, 0]} />
            <Bar dataKey="activos"   name="Activos"         fill={C.green}  radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Req 5 — Métricas por institución (gráfico apilado) */}
      <ChartCard title="Métricas de Proyectos por Institución" subtitle="Comparativa de proyectos activos, en convocatoria y en planificación por cada institución aliada">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metrics.metricasPorInstitucion} margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="activos"    name="Activos"          fill={C.green}  stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="convocados" name="En convocatoria"  fill={C.yellow} stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="planif"     name="En planificación" fill={C.purple} stackId="a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Req 5 + Req 6 — Tabla detallada */}
      <div className="dash-chart-card">
        <div className="dash-chart-header">
          <h3 className="dash-chart-title">Tabla Detallada por Institución</h3>
          <p className="dash-chart-subtitle">Resumen completo incluyendo estudiantes en servicio social externo por institución aliada</p>
        </div>
        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Institución</th>
                <th>Tipo</th>
                <th>Ubicación</th>
                <th>Total Proyectos</th>
                <th>Activos</th>
                <th>En Convocatoria</th>
                <th>En Planificación</th>
                <th>Estudiantes Externos</th>
                <th>Facultades</th>
              </tr>
            </thead>
            <tbody>
              {metrics.metricasPorInstitucion.map((inst) => (
                <tr key={inst.nombre}>
                  <td>
                    <div className="dash-inst-name">
                      <strong>{inst.nombre}</strong>
                      <span className="dash-inst-full">{inst.nombreFull}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`dash-badge ${inst.tipo === 'Pública' ? 'public' : 'private'}`}>{inst.tipo}</span>
                  </td>
                  <td>{inst.ubicacion}</td>
                  <td className="dash-num">{inst.total}</td>
                  <td className="dash-num dash-num-green">{inst.activos}</td>
                  <td className="dash-num dash-num-yellow">{inst.convocados}</td>
                  <td className="dash-num dash-num-purple">{inst.planif}</td>
                  <td className="dash-num"><strong>{inst.estudiantes}</strong></td>
                  <td className="dash-num">{inst.facultades}</td>
                </tr>
              ))}
              <tr className="dash-table-total">
                <td colSpan={3}><strong>TOTALES</strong></td>
                <td className="dash-num"><strong>{metrics.metricasPorInstitucion.reduce((s, i) => s + i.total, 0)}</strong></td>
                <td className="dash-num"><strong>{metrics.metricasPorInstitucion.reduce((s, i) => s + i.activos, 0)}</strong></td>
                <td className="dash-num"><strong>{metrics.metricasPorInstitucion.reduce((s, i) => s + i.convocados, 0)}</strong></td>
                <td className="dash-num"><strong>{metrics.metricasPorInstitucion.reduce((s, i) => s + i.planif, 0)}</strong></td>
                <td className="dash-num"><strong>{metrics.totalEstudiantesExterno}</strong></td>
                <td className="dash-num"><strong>{metrics.metricasPorInstitucion.reduce((s, i) => s + i.facultades, 0)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
