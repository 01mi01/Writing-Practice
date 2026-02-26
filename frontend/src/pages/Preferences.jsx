import { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import Navbar from "../components/Navbar";
import BackgroundAnimated from "../components/BackgroundAnimated";
import { applyTheme } from "../utils/applyTheme";
import API_URL from "../utils/api";

const Preferences = ({ onNavigate, onLogout }) => {
  const [themes, setThemes] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedThemeId, setSelectedThemeId] = useState(null);
  const [selectedColorId, setSelectedColorId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const navLinks = [
    { label: "Inicio", onClick: () => onNavigate("user-dashboard") },
    { label: "Mis textos", onClick: () => onNavigate("mis-textos") },
    { label: "Vocabulario", onClick: () => onNavigate("vocabulario") },
    { label: "Personalizar", onClick: () => onNavigate("preferences") },
    { label: "Cerrar sesión", onClick: onLogout },
  ];

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [themesRes, colorsRes, prefsRes] = await Promise.all([
          fetch(`${API_URL}/api/preferences/themes`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/preferences/colors`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/preferences`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const themesData = await themesRes.json();
        const colorsData = await colorsRes.json();
        const prefsData = await prefsRes.json();

        setThemes(themesData);
        setColors(colorsData);
        setSelectedThemeId(prefsData.theme_id);
        setSelectedColorId(prefsData.color_id);

        applyTheme(
          prefsData?.theme?.theme_name ?? "light",
          prefsData?.color?.color_name ?? "cold",
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchAll();
  }, []);

  const getThemeName = (id) =>
    themes.find((t) => t.theme_id === id)?.theme_name ?? "";
  const getColorName = (id) =>
    colors.find((c) => c.color_id === id)?.color_name ?? "";

  const handleThemeChange = (id) => {
    setSelectedThemeId(id);
    applyTheme(getThemeName(id), getColorName(selectedColorId));
  };

  const handleColorChange = (id) => {
    setSelectedColorId(id);
    applyTheme(getThemeName(selectedThemeId), getColorName(id));
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback("");
    try {
      const res = await fetch(`${API_URL}/api/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          theme_id: selectedThemeId,
          color_id: selectedColorId,
        }),
      });
      if (res.ok) {
        setFeedback("Guardado");
        setTimeout(() => setFeedback(""), 2500);
      } else {
        setFeedback("Error al guardar");
      }
    } catch {
      setFeedback("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const defaultThemeId =
      themes.find((t) => t.theme_name.toLowerCase() === "light")?.theme_id ?? 1;
    const defaultColorId =
      colors.find((c) => c.color_name.toLowerCase() === "cold")?.color_id ?? 1;

    setSelectedThemeId(defaultThemeId);
    setSelectedColorId(defaultColorId);
    applyTheme("light", "cold");

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          theme_id: defaultThemeId,
          color_id: defaultColorId,
        }),
      });
      if (res.ok) {
        setFeedback("Valores predeterminados restablecidos");
        setTimeout(() => setFeedback(""), 2500);
      }
    } catch {
      setFeedback("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const selectStyle = {
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-primary)",
    borderRadius: "14px",
    padding: "10px 40px 10px 14px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
  };

  const btnStyle = {
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    border: "1px solid var(--glass-border)",
    boxShadow: "var(--glass-shadow)",
    color: "var(--text-primary)",
    borderRadius: "14px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
    flex: 1,
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden pb-16"
      style={{
        background:
          "linear-gradient(135deg, var(--bg-gradient-from), var(--bg-gradient-via), var(--bg-gradient-to))",
      }}
    >
      <BackgroundAnimated />
      <Navbar links={navLinks} activePage="Personalizar" />

      <section className="px-4 sm:px-8 py-10 relative z-10">
        <div className="max-w-2xl mx-auto">
          <GlassCard className="px-8 sm:px-12 py-10 shadow-2xl flex flex-col gap-8">
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Personalización
            </h2>

            {/* Theme */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Tema
              </label>
              <div className="relative">
                <select
                  value={selectedThemeId ?? ""}
                  onChange={(e) => handleThemeChange(parseInt(e.target.value))}
                  style={selectStyle}
                >
                  {themes.map((t) => (
                    <option
                      key={t.theme_id}
                      value={t.theme_id}
                      style={{
                        background: "var(--select-option-bg)",
                        color: "var(--select-option-color)",
                      }}
                    >
                      {t.theme_name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Color scheme */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Esquema de colores
              </label>
              <div className="relative">
                <select
                  value={selectedColorId ?? ""}
                  onChange={(e) => handleColorChange(parseInt(e.target.value))}
                  style={selectStyle}
                >
                  {colors.map((c) => (
                    <option
                      key={c.color_id}
                      value={c.color_id}
                      style={{
                        background: "var(--select-option-bg)",
                        color: "var(--select-option-color)",
                      }}
                    >
                      {c.color_name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {feedback && (
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  {feedback}
                </span>
              )}
              <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto w-full sm:w-auto">
                <button
                  onClick={handleReset}
                  disabled={saving}
                  style={btnStyle}
                  className="px-8 py-3 font-semibold text-base rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--glass-border)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--glass-bg)")
                  }
                >
                  Restablecer valores predeterminados
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ ...btnStyle, fontWeight: 600 }}
                  className="px-8 py-3 font-semibold text-base rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--glass-border)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--glass-bg)")
                  }
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};

export default Preferences;