import { useState } from "react";
import GlassCard from "./GlassCard";

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
    <div style={{ position: "relative" }}>
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
        <>
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute mt-1 rounded-xl shadow-2xl overflow-auto max-h-52"
            style={{
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.7)",
              zIndex: 9999,
              minWidth: "220px",
              top: "100%",
              left: 0,
            }}
          >
            {options.map((opt) => (
              <label
                key={opt[valueKey]}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(200,220,255,0.35)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt[valueKey])}
                  onChange={() => toggle(opt[valueKey])}
                />
                {opt[labelKey]}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const DashboardFilterBar = ({
  englishLevels,
  certifications,
  startDate, setStartDate,
  endDate, setEndDate,
  minAge, setMinAge,
  maxAge, setMaxAge,
  selectedLevels, setSelectedLevels,
  selectedCerts, setSelectedCerts,
  frequencyPeriod, setFrequencyPeriod,
  onApply,
  onReset,
}) => {
  return (
    <div style={{ position: "relative", zIndex: 200 }}>
      <GlassCard className="p-5 shadow-xl">
        <div className="flex flex-wrap gap-3 items-end">

          <div className="flex flex-col gap-1 min-w-[130px]">
            <label className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Fecha inicio</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1 min-w-[130px]">
            <label className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Fecha fin</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1 min-w-[80px]">
            <label className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Edad mín.</label>
            <input type="number" min="0" max="120" placeholder="–" value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1 min-w-[80px]">
            <label className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Edad máx.</label>
            <input type="number" min="0" max="120" placeholder="–" value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-xs font-medium" style={{ color: "var(---text-primary)" }}>Nivel de inglés</label>
            <MultiSelect
              options={englishLevels}
              selected={selectedLevels}
              onChange={setSelectedLevels}
              labelKey="level_name"
              valueKey="level_id"
              placeholder="Todos"
            />
          </div>

          <div className="flex flex-col gap-1 min-w-[170px]">
            <label className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Certificaciones</label>
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
            <label className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Período</label>
            <select value={frequencyPeriod} onChange={(e) => setFrequencyPeriod(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none" style={inputStyle}>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
              <option value="year">Año</option>
            </select>
          </div>

          <div className="flex gap-2 ml-auto items-end pb-0.5">
            <button
              onClick={onReset}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.5)", color: "var(--text-secondary)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.45)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
            >
              Limpiar
            </button>
            <button
              onClick={onApply}
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
    </div>
  );
};

export default DashboardFilterBar;