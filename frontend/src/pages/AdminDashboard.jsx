import { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import Navbar from "../components/Navbar";
import BackgroundStatic from "../components/BackgroundStatic";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const CHART_COLORS = [
  "var(--chart-1)", "var(--chart-4)", "var(--chart-2)",
  "var(--chart-5)", "var(--chart-3)", "var(--chart-6)",
];

const glassTooltip = {
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

const cardHeight = "min-h-[220px]";

const StatCard = ({ label, value, unit }) => (
  <GlassCard className={`p-6 shadow-xl flex flex-col gap-3 ${cardHeight}`}>
    <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
      {label}
    </p>
    <p className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
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
    <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
      {label}
    </p>
    <div className="flex-1 w-full" style={{ minHeight: "170px" }}>
      {children}
    </div>
  </GlassCard>
);

const inputStyle = {
  background: "rgba(255,255,255,0.35)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.5)",
  color: "var(--text-primary)",
};

const MultiSelect = ({ options, selected, onChange, labelKey, valueKey, placeholder }) => {
  const [open, setOpen] = useState(false);

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  const label = selected.length === 0
    ? placeholder
    : options.filter((o) => selected.includes(o[valueKey])).map((o) => o[labelKey]).join(", ");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-xl px-3 py-2 text-sm text-left flex justify-between items-center"
        style={{ ...inputStyle, minWidth: "140px" }}
      >
        <span className="truncate" style={{ color: selected.length ? "var(--text-primary)" : "var(--text-muted)" }}>
          {label}
        </span>
        <span style={{ color: "var(--text-muted)", marginLeft: "6px" }}>▾</span>
      </button>
      {open && (
        <div
          className="absolute mt-1 w-full rounded-xl shadow-2xl overflow-auto max-h-52"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.7)",
            zIndex: 9999,
            minWidth: "200px",
          }}
        >
          {options.map((opt) => (
            <label
              key={opt[valueKey]}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm"
              style={{ color: "var(--text-primary)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.6)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt[valueKey])}
                onChange={() => toggle(opt[valueKey])}
                className="rounded"
              />
              {opt[labelKey]}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminDashboard = ({ onLogout }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [englishLevels, setEnglishLevels] = useState([]);
  const [certifications, setCertifications] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedCerts, setSelectedCerts] = useState([]);
  const [frequencyPeriod, setFrequencyPeriod] = useState("month");

  const navLinks = [
    { label: "Inicio", onClick: () => {} },
    { label: "Cerrar sesión", onClick: onLogout },
  ];

  const buildParams = (period, sd, ed, minA, maxA, levels, certs) => {
    const p = new URLSearchParams();
    p.set("frequencyPeriod", period);
    if (sd) p.set("startDate", sd);
    if (ed) p.set("endDate", ed);
    if (minA) p.set("minAge", minA);
    if (maxA) p.set("maxAge", maxA);
    if (levels.length) p.set("englishLevelIds", levels.join(","));
    if (certs.length) p.set("certificationIds", certs.join(","));
    return p.toString();
  };

  const fetchDashboardData = async (params) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/admin/dashboard?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("http://localhost:3000/api/auth/english-levels")
      .then((r) => r.json()).then(setEnglishLevels).catch(console.error);
    fetch("http://localhost:3000/api/auth/certifications")
      .then((r) => r.json()).then(setCertifications).catch(console.error);
    fetchDashboardData(buildParams("month", "", "", "", "", [], []));
  }, []);

  const handleApply = () => {
    fetchDashboardData(buildParams(frequencyPeriod, startDate, endDate, minAge, maxAge, selectedLevels, selectedCerts));
  };

  const handleReset = () => {
    setStartDate(""); setEndDate(""); setMinAge(""); setMaxAge("");
    setSelectedLevels([]); setSelectedCerts([]); setFrequencyPeriod("month");
    fetchDashboardData(buildParams("month", "", "", "", "", [], []));
  };

  const fmtDate = (val) =>
    new Date(val).toLocaleDateString("es-ES", { month: "short", year: "numeric" });

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

  const tickStyle = { fill: "var(--chart-tick)", fontSize: 11 };
  const gridStroke = "var(--chart-grid)";

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    if (parseFloat(percentage) < 5) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
        style={{ fill: "white", fontSize: 11, fontWeight: 600 }}>
        {percentage}%
      </text>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-16"
      style={{ background: "linear-gradient(135deg, var(--bg-gradient-from), var(--bg-gradient-via), var(--bg-gradient-to))" }}>
      <BackgroundStatic />
      <Navbar links={navLinks} />

      <section className="px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col">

          {/* Title — same spacing as landing hero */}
          <h2 className="text-2xl sm:text-3xl font-bold text-center mt-10 mb-10"
            style={{ background: "linear-gradient(to right, var(--text-primary), var(--text-secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Métricas de desempeño de los usuarios
          </h2>

          {/* Filter bar */}
          <GlassCard className="p-5 shadow-xl" style={{ position: "relative", zIndex: 50 }}>
            <div className="flex flex-wrap gap-3 items-end">

              <div className="flex flex-col gap-1 min-w-[130px]">
                <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Fecha inicio</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-xl px-3 py-2 text-sm outline-none" style={inputStyle} />
              </div>

              <div className="flex flex-col gap-1 min-w-[130px]">
                <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Fecha fin</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-xl px-3 py-2 text-sm outline-none" style={inputStyle} />
              </div>

              <div className="flex flex-col gap-1 min-w-[80px]">
                <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Edad mín.</label>
                <input type="number" min="0" max="120" placeholder="–" value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  className="rounded-xl px-3 py-2 text-sm outline-none" style={inputStyle} />
              </div>

              <div className="flex flex-col gap-1 min-w-[80px]">
                <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Edad máx.</label>
                <input type="number" min="0" max="120" placeholder="–" value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  className="rounded-xl px-3 py-2 text-sm outline-none" style={inputStyle} />
              </div>

              <div className="flex flex-col gap-1 min-w-[150px]" style={{ position: "relative", zIndex: 100 }}>
                <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Nivel de inglés</label>
                <MultiSelect
                  options={englishLevels}
                  selected={selectedLevels}
                  onChange={setSelectedLevels}
                  labelKey="level_name"
                  valueKey="level_id"
                  placeholder="Todos"
                />
              </div>

              <div className="flex flex-col gap-1 min-w-[170px]" style={{ position: "relative", zIndex: 99 }}>
                <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Certificaciones</label>
                <MultiSelect
                  options={certifications}
                  selected={selectedCerts}
                  onChange={setSelectedCerts}
                  labelKey="certification_name"
                  valueKey="certification_id"
                  placeholder="Todas"
                />
              </div>

              <div className="flex flex-col gap-1 min-w-[120px]">
                <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Período</label>
                <select value={frequencyPeriod} onChange={(e) => setFrequencyPeriod(e.target.value)}
                  className="rounded-xl px-3 py-2 text-sm outline-none" style={inputStyle}>
                  <option value="week">Semana</option>
                  <option value="month">Mes</option>
                  <option value="year">Año</option>
                </select>
              </div>

              <div className="flex gap-2 ml-auto items-end pb-0.5">
                <button onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: "rgba(255,255,255,0.25)",
                    border: "1px solid rgba(255,255,255,0.5)",
                    color: "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.45)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}>
                  Limpiar
                </button>
                <button
                  onClick={handleApply}
                  className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.50)",
                    boxShadow: "0 4px 24px rgba(255,255,255,0.10)",
                    color: "var(--text-primary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.35)";
                    e.currentTarget.style.boxShadow = "0 4px 28px rgba(255,255,255,0.18)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.boxShadow = "0 4px 24px rgba(255,255,255,0.10)";
                  }}
                >
                  Aplicar
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Gap between filter bar and grid */}
          <div className="mt-10" />

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <GlassCard className="px-10 py-8 shadow-2xl">
                <p className="text-lg font-medium" style={{ color: "var(--text-secondary)" }}>Cargando...</p>
              </GlassCard>
            </div>
          ) : (
            <div className="flex flex-col gap-5 pb-4">

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
                    <BarChart data={formatFrequencyData(metrics?.charts?.frequency_data)} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                      <XAxis dataKey="period" tick={tickStyle} axisLine={false} tickLine={false} />
                      <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                      <Tooltip {...glassTooltip} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {formatFrequencyData(metrics?.charts?.frequency_data).map((_, i) => (
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
                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Pie data={formatConnectorData(metrics?.connector_usage)}
                        cx="50%" cy="42%" outerRadius="75%" dataKey="value"
                        labelLine={false} label={CustomPieLabel}>
                        {formatConnectorData(metrics?.connector_usage).map((_, i) => (
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
                    <LineChart data={formatVocabUsageData(metrics?.charts?.vocabulary_usage_over_time)} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
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
                    <LineChart data={formatSpellingErrorsData(metrics?.charts?.spelling_errors_over_time)} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
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
                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Pie data={formatTextTypeData(metrics?.texts_by_type)}
                        cx="50%" cy="42%" outerRadius="75%" dataKey="value"
                        labelLine={false} label={CustomPieLabel}>
                        {formatTextTypeData(metrics?.texts_by_type).map((entry, i) => (
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
          )}

        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;