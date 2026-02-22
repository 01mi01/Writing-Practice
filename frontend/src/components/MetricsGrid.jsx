import GlassCard from "./GlassCard";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

export const CHART_COLORS = [
  "var(--chart-1)", "var(--chart-4)", "var(--chart-2)",
  "var(--chart-5)", "var(--chart-3)", "var(--chart-6)",
];

export const glassTooltip = {
  contentStyle: {
    background: "var(--chart-tooltip-bg)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid var(--chart-tooltip-border)",
    borderRadius: "14px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
    color: "var(--text-primary)",
    fontSize: "13px",
  },
  itemStyle: { color: "var(--text-secondary)" },
  cursor: { fill: "rgba(255,255,255,0.08)" },
};

const cardHeight = "min-h-[240px]";
const tickStyle = { fill: "var(--chart-tick)", fontSize: 11 };
const gridStroke = "var(--chart-grid)";

export const StatCard = ({ label, value, unit }) => (
  <GlassCard className={`p-6 shadow-xl flex flex-col gap-3 ${cardHeight}`}>
    <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
      {label}
    </p>
    <p className="font-bold" style={{ color: "var(--text-primary)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1.1 }}>
      {value ?? 0}
      {unit && (
        <span className="text-base font-medium ml-1" style={{ color: "var(--text-muted)" }}>
          {unit}
        </span>
      )}
    </p>
  </GlassCard>
);

export const ChartCard = ({ label, children }) => (
  <GlassCard className={`p-5 shadow-xl flex flex-col gap-3 ${cardHeight}`}>
    <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
      {label}
    </p>
    <div className="flex-1 w-full" style={{ minHeight: "185px" }}>
      {children}
    </div>
  </GlassCard>
);

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
  if (parseFloat(percentage) < 40) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.58;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x} y={y}
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fill: "white", fontSize: 13, fontWeight: 700 }}
    >
      {percentage}%
    </text>
  );
};

const fmtDate = (val) =>
  new Date(val).toLocaleDateString("es-ES", { month: "short", year: "numeric" });

const AdminMetricsGrid = ({ metrics }) => {
  const formatFrequencyData = (data) => {
    if (!data?.length) return [];
    return data.map((item) => ({ period: fmtDate(item.period), count: parseInt(item.count) }));
  };

  const formatVocabUsageData = (data) => {
    if (!data?.length) return [];
    return data.map((item) => ({ period: fmtDate(item.period), total: parseInt(item.total_vocab_used) }));
  };

  const formatSpellingErrorsData = (data) => {
    if (!data?.length) return [];
    return data.map((item) => ({ period: fmtDate(item.period), errors: parseFloat(item.avg_errors).toFixed(2) }));
  };

  const formatConnectorData = (connectorUsage) => {
    if (!connectorUsage) return [];
    return [
      { name: "Básicos", value: parseFloat(connectorUsage.basic_percentage), count: connectorUsage.total_basic },
      { name: "Avanzados", value: parseFloat(connectorUsage.advanced_percentage), count: connectorUsage.total_advanced },
    ];
  };

  const formatTextTypeData = (data) => {
    if (!data?.length) return [];
    const sorted = [...data].sort((a, b) => parseInt(b.count) - parseInt(a.count));
    const top5 = sorted.slice(0, 5);
    const othersCount = sorted.slice(5).reduce((sum, item) => sum + parseInt(item.count), 0);
    const combined = othersCount > 0
      ? [...top5, { textType: { type_name: "Otros" }, count: othersCount }]
      : top5;
    const total = combined.reduce((sum, item) => sum + parseInt(item.count), 0);
    return combined.map((item, index) => ({
      name: item.textType?.type_name ?? "Otro",
      value: parseInt(item.count),
      percentage: ((parseInt(item.count) / total) * 100).toFixed(1),
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  };

  const freqData = formatFrequencyData(metrics?.charts?.frequency_data);
  const vocabData = formatVocabUsageData(metrics?.charts?.vocabulary_usage_over_time);
  const errorsData = formatSpellingErrorsData(metrics?.charts?.spelling_errors_over_time);
  const connectorData = formatConnectorData(metrics?.connector_usage);
  const textTypeData = formatTextTypeData(metrics?.texts_by_type);

  return (
    <div className="flex flex-col gap-5">

      {/* Row 1 – Volume */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard label="Número de usuarios" value={metrics?.statistics?.total_users} />
        <StatCard label="Entradas de texto creadas" value={metrics?.statistics?.total_texts} />
        <StatCard label="Promedio de palabras por texto" value={metrics?.statistics?.avg_word_count} />
      </div>

      {/* Row 2 – Engagement */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard label="Promedio de rachas actuales" value={metrics?.statistics?.avg_current_streak} unit="días" />
        <StatCard label="Promedio de rachas más largas" value={metrics?.statistics?.avg_longest_streak} unit="días" />
        <ChartCard label="Frecuencia de uso">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={freqData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="period" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
              <Tooltip {...glassTooltip} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {freqData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3 – Language & Vocab */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <ChartCard label="Uso de conectores">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
              <Pie
                data={connectorData}
                cx="50%" cy="45%" outerRadius="78%"
                dataKey="value" labelLine={false} label={CustomPieLabel}
              >
                {connectorData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...glassTooltip} formatter={(val) => [`${val}%`, ""]} />
              <Legend iconType="circle" iconSize={8}
                wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <StatCard label="Promedio de palabras en lista de vocabulario personal" value={metrics?.statistics?.avg_vocab_per_user} />

        <ChartCard label="Uso de vocabulario personal">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={vocabData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="period" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
              <Tooltip {...glassTooltip} />
              <Line type="monotone" dataKey="total" stroke="var(--chart-1)" strokeWidth={2.5}
                dot={{ fill: "var(--chart-1)", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 4 – Errors & Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard label="Promedio de errores por texto" value={metrics?.statistics?.avg_spelling_errors} />

        <ChartCard label="Cantidad de errores ortográficos">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={errorsData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="period" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
              <Tooltip {...glassTooltip} />
              <Line type="monotone" dataKey="errors" stroke="var(--chart-5)" strokeWidth={2.5}
                dot={{ fill: "var(--chart-5)", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard label="Distribución de tipos de textos">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
              <Pie
                data={textTypeData}
                cx="50%" cy="45%" outerRadius="78%"
                dataKey="value" labelLine={false} label={CustomPieLabel}
              >
                {textTypeData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip {...glassTooltip} formatter={(val, name, props) => [`${props.payload.percentage}%`, props.payload.name]} />
              <Legend iconType="circle" iconSize={8}
                wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

    </div>
  );
};

export default AdminMetricsGrid;