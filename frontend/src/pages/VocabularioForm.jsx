import { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import Navbar from "../components/Navbar";
import BackgroundStatic from "../components/BackgroundStatic";
import { applyTheme } from "../utils/applyTheme";
import API_URL from "../utils/api";

const VocabularioForm = ({ onNavigate, onLogout, editVocabId = null }) => {
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [translation, setTranslation] = useState("");
  const [category, setCategory] = useState("");
  const [usage, setUsage] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editVocabId);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const isEditMode = !!editVocabId;

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
        const prefsRes = await fetch(`${API_URL}/api/preferences`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const prefs = await prefsRes.json();
        applyTheme(prefs?.theme?.theme_name ?? "light", prefs?.color?.color_name ?? "cold");

        if (editVocabId) {
          const vocabRes = await fetch(`${API_URL}/api/vocabulary/${editVocabId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const vocabData = await vocabRes.json();
          setWord(vocabData.word);
          setDefinition(vocabData.definition || "");
          setTranslation(vocabData.translation || "");
          setCategory(vocabData.category || "");
          setUsage(vocabData.usage || "");
          setPronunciation(vocabData.pronunciation || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [editVocabId]);

  const handleSave = async () => {
    if (!word.trim()) {
      setError("La palabra es obligatoria");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const url = isEditMode
        ? `${API_URL}/api/vocabulary/${editVocabId}`
        : `${API_URL}/api/vocabulary`;
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          word,
          definition,
          translation,
          category,
          usage,
          pronunciation,
        }),
      });

      if (!response.ok) throw new Error("Error al guardar");

      onNavigate("vocabulario");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-primary)",
    borderRadius: "10px",
    padding: "10px",
    fontSize: "15px",
    outline: "none",
    width: "100%",
  };

  if (loading) {
    return (
      <div
        className="min-h-screen relative overflow-hidden pb-16"
        style={{
          background:
            "linear-gradient(135deg, var(--bg-gradient-from), var(--bg-gradient-via), var(--bg-gradient-to))",
        }}
      >
        <BackgroundStatic />
        <Navbar links={navLinks} activePage="Vocabulario" />
        <section className="px-4 sm:px-6 lg:px-8 relative z-10 mt-8">
          <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
            <GlassCard className="px-10 py-8 shadow-xl">
              <p className="text-lg font-medium" style={{ color: "var(--text-secondary)" }}>
                Cargando...
              </p>
            </GlassCard>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden pb-16"
      style={{
        background:
          "linear-gradient(135deg, var(--bg-gradient-from), var(--bg-gradient-via), var(--bg-gradient-to))",
      }}
    >
      <BackgroundStatic />
      <Navbar links={navLinks} activePage="Vocabulario" />

      <section className="px-4 sm:px-6 lg:px-8 relative z-10 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            {isEditMode ? "Editar palabra" : "Nueva palabra"}
          </h2>

          <div className="flex flex-col lg:flex-row gap-4">
            <GlassCard className="flex-1 p-6 shadow-xl flex flex-col gap-5">
              {error && (
                <p className="text-sm font-medium" style={{ color: "#ef4444" }}>
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                  Palabra *
                </label>
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                  Definición
                </label>
                <textarea
                  value={definition}
                  onChange={(e) => setDefinition(e.target.value)}
                  rows="4"
                  className="resize-none"
                  style={inputStyle}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                  Traducción
                </label>
                <input
                  type="text"
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                  Categoría
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                  Uso
                </label>
                <input
                  type="text"
                  value={usage}
                  onChange={(e) => setUsage(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                  Pronunciación
                </label>
                <input
                  type="text"
                  value={pronunciation}
                  onChange={(e) => setPronunciation(e.target.value)}
                  placeholder="/prəˌnʌnsiˈeɪʃn/"
                  className="font-mono" 
                  style={inputStyle}
                />
              </div>

              <div className="flex gap-3 pt-3 justify-end">
                <button
                  onClick={() => onNavigate("vocabulario")}
                  className="px-8 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    color: "var(--text-muted)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.20)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: "rgba(255,255,255,0.25)",
                    border: "1px solid rgba(255,255,255,0.5)",
                    color: "var(--text-primary)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.40)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VocabularioForm;