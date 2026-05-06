import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  Download, FileSpreadsheet, TrendingUp, Users, BookOpen,
  Building2, MapPin, Activity, ChevronDown,
} from 'lucide-react';
import { instituciones } from '../data/instituciones';
import { proyectosMapa, marcadoresMapa } from '../data/proyectos';
import type { EstadoProyecto } from '../types';

// ─── Colores del sistema ──────────────────────────────────────────────────────
const COLORS = {
  blue: '#2f68ec',
  green: '#21c08a',
  pink: '#d9488f',
  yellow: '#f5a623',
  purple: '#7c5cbf',
  teal: '#14b8a6',
  orange: '#f97316',
};
const PIE_COLORS = [COLORS.blue, COLORS.green, COLORS.pink, COLORS.purple, COLORS.yellow];

// ─── Derivar métricas desde los datos reales ──────────────────────────────────
function useMetrics() {
  return useMemo(() => {
    const allProjects = instituciones.flatMap((i) => i.proyectos);
    const totalProyectos = allProjects.length;
    const totalEstudiantes = instituciones.reduce((sum, i) => {
      const n = parseInt(i.estadisticas.find(([, l]) => l.includes('Estudiantes'))?.[0] ?? '0', 10);
      return sum + n;
    }, 0);
    const totalInstituciones = instituciones.length;

    // Estado de proyectos
    const estadoCount: Record<EstadoProyecto, number> = {
      Activo: 0, 'En planificación': 0, 'En convocatoria': 0, Cerrado: 0,
    };
    allProjects.forEach((p) => { estadoCount[p.estado] = (estadoCount[p.estado] ?? 0) + 1; });
    const estadoPieData = Object.entries(estadoCount).map(([name, value]) => ({ name, value }));

    // Proyectos por institución (top 6)
    const proyectosPorInstitucion = instituciones
      .map((i) => ({ nombre: i.sigla.split(' ')[0], proyectos: i.proyectos.length, estudiantes: parseInt(i.estadisticas.find(([, l]) => l.includes('Estudiantes'))?.[0] ?? '0', 10) }))
      .sort((a, b) => b.proyectos - a.proyectos)
      .slice(0, 6);

    // Carreras más demandadas
    const carreraCount: Record<string, number> = {};
    allProjects.forEach((p) => p.carreras.forEach((c) => { carreraCount[c] = (carreraCount[c] ?? 0) + 1; }));
    const topCarreras = Object.entries(carreraCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    // Distribución geográfica (de marcadores del mapa)
    const geografico = marcadoresMapa.map((m) => ({
      nombre: m.label,
      hombres: m.hombres,
      mujeres: m.mujeres,
      total: m.hombres + m.mujeres,
    }));

    // Tendencia mensual simulada coherente con datos reales
    const tendenciaMensual = [
      { mes: 'Ene', proyectos: 4, estudiantes: 28 },
      { mes: 'Feb', proyectos: 5, estudiantes: 35 },
      { mes: 'Mar', proyectos: 6, estudiantes: 44 },
      { mes: 'Abr', proyectos: 8, estudiantes: 62 },
      { mes: 'May', proyectos: 9, estudiantes: 71 },
      { mes: 'Jun', proyectos: 11, estudiantes: 89 },
      { mes: 'Jul', proyectos: 10, estudiantes: 95 },
      { mes: 'Ago', proyectos: 13, estudiantes: 118 },
      { mes: 'Sep', proyectos: 14, estudiantes: 134 },
      { mes: 'Oct', proyectos: totalProyectos, estudiantes: totalEstudiantes },
    ];

    // Radar por tipo de impacto
    const radarData = [
      { area: 'Medio Ambiente', valor: 4 },
      { area: 'Educación', valor: 6 },
      { area: 'Salud', valor: 3 },
      { area: 'Tecnología', valor: 5 },
      { area: 'Economía', valor: 4 },
      { area: 'Infraestructura', valor: 2 },
    ];

    return {
      totalProyectos,
      totalEstudiantes,
      totalInstituciones,
      estadoPieData,
      proyectosPorInstitucion,
      topCarreras,
      geografico,
      tendenciaMensual,
      radarData,
    };
  }, []);
}

// ─── Exportar a Excel (CSV) ───────────────────────────────────────────────────
function exportToExcel(metrics: ReturnType<typeof useMetrics>) {
  const sheets = [
    {
      name: 'Resumen General',
      rows: [
        ['Métrica', 'Valor'],
        ['Total Proyectos', metrics.totalProyectos],
        ['Total Estudiantes', metrics.totalEstudiantes],
        ['Total Instituciones', metrics.totalInstituciones],
      ],
    },
    {
      name: 'Estado de Proyectos',
      rows: [['Estado', 'Cantidad'], ...metrics.estadoPieData.map((d) => [d.name, d.value])],
    },
    {
      name: 'Proyectos por Institución',
      rows: [
        ['Institución', 'Proyectos', 'Estudiantes'],
        ...metrics.proyectosPorInstitucion.map((d) => [d.nombre, d.proyectos, d.estudiantes]),
      ],
    },
    {
      name: 'Carreras más Demandadas',
      rows: [['Carrera', 'Proyectos'], ...metrics.topCarreras.map((d) => [d.name, d.value])],
    },
    {
      name: 'Distribución Geográfica',
      rows: [
        ['Departamento', 'Hombres', 'Mujeres', 'Total'],
        ...metrics.geografico.map((d) => [d.nombre, d.hombres, d.mujeres, d.total]),
      ],
    },
    {
      name: 'Tendencia Mensual',
      rows: [
        ['Mes', 'Proyectos', 'Estudiantes'],
        ...metrics.tendenciaMensual.map((d) => [d.mes, d.proyectos, d.estudiantes]),
      ],
    },
  ];

  // Generar CSV multi-hoja como texto único con separadores
  let csvContent = '';
  sheets.forEach((sheet) => {
    csvContent += `\n=== ${sheet.name} ===\n`;
    sheet.rows.forEach((row) => { csvContent += row.join(',') + '\n'; });
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `EduMap_Dashboard_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Exportar a PDF ───────────────────────────────────────────────────────────
function exportToPDF() {
  window.print();
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
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

// ─── Chart wrapper ────────────────────────────────────────────────────────────
function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`dash-chart-card ${className}`}>
      <h3 className="dash-chart-title">{title}</h3>
      {children}
    </div>
  );
}

// ─── Tooltip personalizado ────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="dash-tooltip">
      {label && <p className="dash-tooltip-label">{label}</p>}
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── DashboardPage ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const metrics = useMetrics();
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="dashboard-page wide-page">
      {/* Header del dashboard */}
      <div className="dash-header">
        <div>
          <span className="eyebrow-tag">Métricas generales</span>
          <h1>Dashboard de Impacto</h1>
          <p className="dash-subtitle">
            Resumen de actividad académica y proyección social en El Salvador — Actualizado Oct 2024
          </p>
        </div>
        <div className="dash-export-group">
          <div className="dash-export-wrapper">
            <button
              className="primary-btn"
              type="button"
              onClick={() => setExportOpen((o) => !o)}
            >
              <Download size={16} />
              Exportar
              <ChevronDown size={14} />
            </button>
            {exportOpen && (
              <div className="dash-export-dropdown">
                <button
                  type="button"
                  onClick={() => { exportToPDF(); setExportOpen(false); }}
                >
                  <Download size={15} />
                  Exportar como PDF
                </button>
                <button
                  type="button"
                  onClick={() => { exportToExcel(metrics); setExportOpen(false); }}
                >
                  <FileSpreadsheet size={15} />
                  Exportar como Excel (CSV)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="dash-kpi-grid">
        <KpiCard
          icon={<BookOpen size={22} />}
          label="Total de Proyectos"
          value={metrics.totalProyectos}
          sub="+3 este mes"
          color={COLORS.blue}
        />
        <KpiCard
          icon={<Users size={22} />}
          label="Estudiantes Activos"
          value={metrics.totalEstudiantes}
          sub="En 10 instituciones"
          color={COLORS.green}
        />
        <KpiCard
          icon={<Building2 size={22} />}
          label="Instituciones Aliadas"
          value={metrics.totalInstituciones}
          sub="Públicas y privadas"
          color={COLORS.purple}
        />
        <KpiCard
          icon={<MapPin size={22} />}
          label="Departamentos Activos"
          value={metrics.geografico.length}
          sub="Cobertura nacional"
          color={COLORS.teal}
        />
        <KpiCard
          icon={<Activity size={22} />}
          label="Tasa de Proyectos Activos"
          value={`${Math.round((metrics.estadoPieData.find((d) => d.name === 'Activo')?.value ?? 0) / metrics.totalProyectos * 100)}%`}
          sub="Del total registrado"
          color={COLORS.orange}
        />
        <KpiCard
          icon={<TrendingUp size={22} />}
          label="Promedio Estudiantes/Proyecto"
          value={(metrics.totalEstudiantes / metrics.totalProyectos).toFixed(1)}
          sub="Ratio de asignación"
          color={COLORS.pink}
        />
      </div>

      {/* Fila 1: Tendencia + Pie de estado */}
      <div className="dash-grid-2">
        <ChartCard title="Crecimiento Mensual de Proyectos y Estudiantes" className="dash-wide">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={metrics.tendenciaMensual} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="proyectos" name="Proyectos" stroke={COLORS.blue} strokeWidth={2.5} dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="estudiantes" name="Estudiantes" stroke={COLORS.green} strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Estado de Proyectos">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={metrics.estadoPieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {metrics.estadoPieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Fila 2: Proyectos por institución */}
      <ChartCard title="Proyectos y Estudiantes por Institución">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={metrics.proyectosPorInstitucion} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="proyectos" name="Proyectos" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
            <Bar dataKey="estudiantes" name="Estudiantes" fill={COLORS.green} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Fila 3: Carreras + Radar */}
      <div className="dash-grid-2">
        <ChartCard title="Carreras Más Demandadas en Proyectos">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={metrics.topCarreras} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Proyectos" fill={COLORS.purple} radius={[0, 4, 4, 0]}>
                {metrics.topCarreras.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cobertura de Áreas de Impacto Social">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart cx="50%" cy="50%" outerRadius={100} data={metrics.radarData}>
              <PolarGrid stroke="rgba(0,0,0,0.1)" />
              <PolarAngleAxis dataKey="area" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 8]} tick={{ fontSize: 10 }} />
              <Radar name="Proyectos" dataKey="valor" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.25} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Fila 4: Distribución geográfica por género */}
      <ChartCard title="Distribución Geográfica de Estudiantes por Género">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={metrics.geografico} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="hombres" name="Hombres" fill={COLORS.blue} radius={[4, 4, 0, 0]} stackId="a" />
            <Bar dataKey="mujeres" name="Mujeres" fill={COLORS.pink} radius={[4, 4, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Tabla resumen */}
      <div className="dash-chart-card">
        <h3 className="dash-chart-title">Resumen por Institución</h3>
        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Institución</th>
                <th>Tipo</th>
                <th>Ubicación</th>
                <th>Proyectos</th>
                <th>Estudiantes</th>
                <th>Facultades</th>
              </tr>
            </thead>
            <tbody>
              {instituciones.map((inst) => {
                const estudiantes = inst.estadisticas.find(([, l]) => l.includes('Estudiantes'))?.[0] ?? '–';
                const facultades = inst.estadisticas.find(([, l]) => l.includes('Facultades'))?.[0] ?? '–';
                return (
                  <tr key={inst.id}>
                    <td><strong>{inst.sigla.split(' ').slice(0, 2).join(' ')}</strong></td>
                    <td><span className="dash-badge">{inst.tipo?.includes('Public') ? 'Pública' : 'Privada'}</span></td>
                    <td>{inst.ubicacion}</td>
                    <td className="dash-num">{inst.proyectos.length}</td>
                    <td className="dash-num">{estudiantes}</td>
                    <td className="dash-num">{facultades}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
