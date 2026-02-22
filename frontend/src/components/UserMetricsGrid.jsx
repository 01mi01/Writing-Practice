import GlassCard from "./GlassCard";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { CHART_COLORS, glassTooltip } from "./MetricsGrid";

const cardHeight = "min-h-[240px]";
const tickStyle = { fill: "var(--text-muted)", fontSize: 14 };
const gridStroke = "var(--chart-grid)";

const StatCard = ({ label, value, unit }) => (
  <GlassCard className={`p-6 shadow-xl flex flex-col gap-3 ${cardHeight}`}>
    <p className="text-base font-medium" style={{ color: "var(--text-secondary)" }}>
      {label}
    </p>
    <p className="font-bold" style={{ color: "var(--text-primary)", fontSize: "clamp(2rem, 3.5vw, 2.8rem)", lineHeight: 1.1 }}>
      {value ?? 0}
      {unit && (
        <span className="text-base font-medium ml-1" style={{ color: "var(--text-muted)" }}>
          {unit}
        </span>
      )}
    </p>
  </GlassCard>
);

const ChartCard = ({ label, children }) => (
  <GlassCard className={`p-5 shadow-xl flex flex-col gap-3 ${cardHeight}`}>
    <p className="text-base font-medium" style={{ color: "var(--text-secondary)" }}>
      {label}
    </p>
    <div className="flex-1 w-full" style={{ minHeight: "185px" }}>
      {children}
    </div>
  </GlassCard>
);

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
  if (parseFloat(percentage) < 4) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.58;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
      style={{ fill: "white", fontSize: 13, fontWeight: 700 }}>
      {percentage}%
    </text>
  );
};

const periodSelectStyle = {
  background: "var(--glass-bg)",
  backdropFilter: "var(--glass-blur)",
  WebkitBackdropFilter: "var(--glass-blur)",
  border: "1px solid var(--glass-border)",
  color: "var(--text-primary)",
  borderRadius: "10px",
  padding: "4px 28px 4px 10px",
  fontSize: "13px",
  outline: "none",
  cursor: "pointer",
};

const fmtDate = (val, period) => {
  const d = new Date(val);
  if (period === "year") return d.toLocaleDateString("es-ES", { year: "numeric" });
  if (period === "week") return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  return d.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
};

const UserMetricsGrid = ({ data }) => {
  const [freqPeriod, setFreqPeriod] = useState("month");

  if (!data) return null;

  const { summary, connector_usage, charts } = data;

  const freqMap = {
    week: charts?.frequency_per_week,
    month: charts?.frequency_per_month,
    year: charts?.frequency_per_year,
  };

  const freqData = (freqMap[freqPeriod] ?? []).map((item) => ({
    period: fmtDate(item.period, freqPeriod),
    count: parseInt(item.count),
  }));

  const vocabData = (charts?.vocabulary_usage_over_time ?? []).map((item) => ({
    period: fmtDate(item.period, "month"),
    total: parseInt(item.total_vocab_used),
  }));

  const errorsData = (charts?.spelling_errors_over_time ?? []).map((item) => ({
    period: fmtDate(item.period, "month"),
    errors: parseFloat(item.avg_errors).toFixed(2),
  }));

  const connectorData = connector_usage
    ? [
        { name: "Básicos", value: parseFloat(connector_usage.basic_percentage) },
        { name: "Avanzados", value: parseFloat(connector_usage.advanced_percentage) },
      ]
    : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        <GlassCard className={`p-5 shadow-xl flex flex-col gap-3 ${cardHeight}`}>
          <div className="flex items-center justify-between">
            <p className="text-base font-medium" style={{ color: "var(--text-secondary)" }}>
              Frecuencia de uso
            </p>
            <div className="relative">
              <select value={freqPeriod} onChange={(e) => setFreqPeriod(e.target.value)} className="appearance-none pr-7" style={periodSelectStyle}>
              <option value="week" style={{ background: "var(--select-option-bg)", color: "var(--select-option-color)" }}>Semana</option>
              <option value="month" style={{ background: "var(--select-option-bg)", color: "var(--select-option-color)" }}>Mes</option>
              <option value="year" style={{ background: "var(--select-option-bg)", color: "var(--select-option-color)" }}>Año</option>
            </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-muted)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full" style={{ minHeight: "185px" }}>
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
          </div>
        </GlassCard>

        <StatCard label="Cantidad de palabras por texto" value={summary?.avg_word_count} />

        <ChartCard label="Uso de conectores">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
              <Pie data={connectorData} cx="50%" cy="45%" outerRadius="78%"
                dataKey="value" labelLine={false} label={CustomPieLabel}>
                {connectorData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...glassTooltip} formatter={(val) => [`${val}%`, ""]} />
              <Legend iconType="circle" iconSize={8}
                wrapperStyle={{ fontSize: 13, color: "var(--text-secondary)" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        <ChartCard label="Uso de vocabulario personal">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={vocabData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="period" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
              <Tooltip {...glassTooltip} />
              <Line type="monotone" dataKey="total" stroke="var(--chart-3)" strokeWidth={2.5}
                dot={{ fill: "var(--chart-2)", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard label="Cantidad de errores ortográficos">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={errorsData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="period" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
              <Tooltip {...glassTooltip} />
              <Line type="monotone" dataKey="errors" stroke="var(--chart-5)" strokeWidth={2.5}
                dot={{ fill: "var(--chart-4)", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <StatCard label="Entradas de texto" value={summary?.total_texts} />
      </div>

    </div>
  );
};

export default UserMetricsGrid;