import { useState, useEffect, useRef } from "react";
import GlassCard from "../components/GlassCard";
import Navbar from "../components/Navbar";
import BackgroundStatic from "../components/BackgroundStatic";
import { applyTheme } from "../utils/applyTheme";

const NuevaEntrada = ({ onNavigate, onLogout, editTextId = null }) => {
  const [textTypes, setTextTypes] = useState([]);
  const [title, setTitle] = useState("Nueva entrada de texto");
  const [editingTitle, setEditingTitle] = useState(false);
  const [content, setContent] = useState("");
  const [textTypeId, setTextTypeId] = useState("");
  const [editingType, setEditingType] = useState(false);
  const [targetWords, setTargetWords] = useState(350);
  const [editingTarget, setEditingTarget] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null); // { suggestions, spell_check, text }
  const [error, setError] = useState("");

  const titleInputRef = useRef(null);
  const token = localStorage.getItem("token");

  const navLinks = [
    { label: "Inicio", onClick: () => onNavigate("user-dashboard") },
    { label: "Mis textos", onClick: () => onNavigate("mis-textos") },
    { label: "Vocabulario", onClick: () => onNavigate("vocabulario") },
    { label: "Personalizar", onClick: () => onNavigate("preferences") },
    { label: "Cerrar sesión", onClick: onLogout },
  ];

  useEffect(() => {
    const init = async () => {
      try {
        const [prefsRes, typesRes] = await Promise.all([
          fetch("http://localhost:3000/api/preferences", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:3000/api/texts/types", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const prefs = await prefsRes.json();
        const types = await typesRes.json();
        applyTheme(prefs?.theme?.theme_name ?? "light", prefs?.color?.color_name ?? "cold");
        setTextTypes(types);
        if (types.length > 0) setTextTypeId(types[0].type_id);

        if (editTextId) {
          const textRes = await fetch(`http://localhost:3000/api/texts/${editTextId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const textData = await textRes.json();
          setTitle(textData.title);
          setContent(textData.content);
          setTextTypeId(textData.text_type_id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;

  const handleSave = async () => {
    if (!content.trim()) { setError("El contenido no puede estar vacío."); return; }
    if (!textTypeId) { setError("Selecciona un tipo de texto."); return; }
    setError("");
    setSaving(true);
    setSaveResult(null);
    try {
      const url = editTextId
        ? `http://localhost:3000/api/texts/${editTextId}`
        : "http://localhost:3000/api/texts";
      const method = editTextId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content, text_type_id: parseInt(textTypeId) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error al guardar"); return; }
      setSaveResult(data);
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-primary)",
    borderRadius: "10px",
    padding: "6px 10px",
    fontSize: "13px",
    outline: "none",
    width: "100%",
  };

  const selectedTypeName = textTypes.find((t) => t.type_id === parseInt(textTypeId))?.type_name ?? "";

  const progressPct = Math.min((wordCount / targetWords) * 100, 100);

  return (
    <div
      className="min-h-screen relative overflow-hidden pb-16"
      style={{ background: "linear-gradient(135deg, var(--bg-gradient-from), var(--bg-gradient-via), var(--bg-gradient-to))" }}
    >
      <BackgroundStatic />
      <Navbar links={navLinks} activePage="Mis textos" />

      <section className="px-4 sm:px-6 lg:px-8 relative z-10 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">

          {/* Editable title */}
          <div className="flex items-center gap-2">
            {editingTitle ? (
              <input
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                autoFocus
                className="text-2xl sm:text-3xl font-bold bg-transparent outline-none border-b-2 flex-1"
                style={{ color: "var(--text-primary)", borderColor: "var(--glass-border)" }}
              />
            ) : (
              <h2
                className="text-2xl sm:text-3xl font-bold flex-1"
                style={{ color: "var(--text-primary)" }}
              >
                {title}
              </h2>
            )}
            <button
              onClick={() => { setEditingTitle(true); setTimeout(() => titleInputRef.current?.focus(), 50); }}
              className="p-2 rounded-xl transition-all"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
              title="Editar título"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3.536 3.536-6 6H9v-3.536z" />
              </svg>
            </button>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-4">

            {/* LEFT — writing canvas */}
            <GlassCard className="flex-1 p-5 shadow-xl flex flex-col" style={{ minHeight: "520px" }}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Comienza a escribir aquí…"
                className="flex-1 w-full bg-transparent outline-none resize-none text-base leading-relaxed"
                style={{ color: "var(--text-primary)", minHeight: "480px" }}
              />
            </GlassCard>

            {/* RIGHT — sidebar */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
              <GlassCard className="p-5 shadow-xl flex flex-col gap-5">

                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  Resumen
                </h3>

                {/* Tipo de texto */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    Tipo de texto
                  </label>
                  {editingType ? (
                    <select
                      value={textTypeId}
                      onChange={(e) => { setTextTypeId(e.target.value); setEditingType(false); }}
                      onBlur={() => setEditingType(false)}
                      autoFocus
                      style={{ ...inputStyle }}
                    >
                      {textTypes.map((t) => (
                        <option key={t.type_id} value={t.type_id}
                          style={{ background: "var(--select-option-bg)", color: "var(--select-option-color)" }}>
                          {t.type_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {selectedTypeName}
                      </span>
                      <button onClick={() => setEditingType(true)} style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3.536 3.536-6 6H9v-3.536z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Número de palabras objetivo */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    Número de palabras objetivo
                  </label>
                  {editingTarget ? (
                    <input
                      type="number"
                      value={targetWords}
                      onChange={(e) => setTargetWords(parseInt(e.target.value) || 0)}
                      onBlur={() => setEditingTarget(false)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingTarget(false)}
                      autoFocus
                      style={inputStyle}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {targetWords}
                      </span>
                      <button onClick={() => setEditingTarget(true)} style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3.536 3.536-6 6H9v-3.536z" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {/* Progress bar */}
                  <div className="w-full rounded-full overflow-hidden mt-1" style={{ height: "4px", background: "var(--glass-border)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progressPct}%`,
                        background: "linear-gradient(to right, var(--color-1-from), var(--color-1-to))",
                      }}
                    />
                  </div>
                </div>

                {/* Live metrics */}
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: "Palabras escritas", value: wordCount },
                    { label: "Uso de conectores avanzados", value: saveResult?.text?.advanced_connectors_count ?? "—" },
                    { label: "Palabras de la lista de vocabulario", value: saveResult?.text?.vocab_words_used ?? "—" },
                    { label: "Errores ortográficos", value: saveResult?.spell_check?.error_count ?? "—" },
                  ].map((m) => (
                    <p key={m.label} className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      <span style={{ color: "var(--text-muted)" }}>{m.label}: </span>
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{m.value}</span>
                    </p>
                  ))}
                </div>

                {/* Suggestions */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    Sugerencias
                  </h4>
                  {saveResult?.suggestions ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                        {saveResult.suggestions.message}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {saveResult.suggestions.recommendation}
                      </p>
                      {saveResult.suggestions.suggested_connectors?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {saveResult.suggestions.suggested_connectors.slice(0, 8).map((c) => (
                            <span key={c} className="text-xs px-2 py-0.5 rounded-lg"
                              style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)" }}>
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Guarda todos los cambios para obtener sugerencias.
                    </p>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <p className="text-xs font-medium" style={{ color: "#ef4444" }}>{error}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: "rgba(255,255,255,0.25)",
                      border: "1px solid rgba(255,255,255,0.5)",
                      color: "var(--text-primary)",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.40)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => onNavigate("mis-textos")}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: "rgba(255,255,255,0.10)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "var(--text-muted)",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.20)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.10)"}
                  >
                    Cancelar
                  </button>
                </div>

              </GlassCard>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NuevaEntrada;