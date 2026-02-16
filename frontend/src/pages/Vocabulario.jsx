import { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import Navbar from "../components/Navbar";
import BackgroundStatic from "../components/BackgroundStatic";
import { applyTheme } from "../utils/applyTheme";

const Vocabulario = ({ onNavigate, onLogout }) => {
  const [vocabulary, setVocabulary] = useState([]);
  const [filteredVocabulary, setFilteredVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [translation, setTranslation] = useState("");
  const [category, setCategory] = useState("");
  const [usage, setUsage] = useState("");
  const [pronunciation, setPronunciation] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const navLinks = [
    { label: "Inicio", onClick: () => onNavigate("user-dashboard") },
    { label: "Mis textos", onClick: () => onNavigate("mis-textos") },
    { label: "Vocabulario", onClick: () => onNavigate("vocabulario") },
    { label: "Personalizar", onClick: () => onNavigate("preferences") },
    { label: "Cerrar sesión", onClick: onLogout },
  ];

  const token = localStorage.getItem("token");

  const categories = [
    "Educación",
    "Negocios",
    "Literatura",
    "Tecnología",
    "Salud",
    "Arte",
    "Ciencia",
    "Deportes",
  ];
  const usageTypes = [
    "Sustantivo",
    "Verbo",
    "Adjetivo",
    "Adverbio",
    "Conector",
    "Preposición",
  ];

  useEffect(() => {
    fetchPrefsAndVocabulary();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredVocabulary(vocabulary);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredVocabulary(
        vocabulary.filter(
          (v) =>
            v.word.toLowerCase().includes(query) ||
            v.definition?.toLowerCase().includes(query) ||
            v.translation?.toLowerCase().includes(query),
        ),
      );
    }
  }, [searchQuery, vocabulary]);

  const fetchPrefsAndVocabulary = async () => {
    setLoading(true);
    try {
      const [prefsRes, vocabRes] = await Promise.all([
        fetch("http://localhost:3000/api/preferences", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3000/api/vocabulary", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const prefs = await prefsRes.json();
      const vocabData = await vocabRes.json();

      applyTheme(
        prefs?.theme?.theme_name ?? "light",
        prefs?.color?.color_name ?? "cold",
      );
      setVocabulary(vocabData);
      setFilteredVocabulary(vocabData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    onNavigate("nueva-palabra");
  };

  const openEditForm = (vocab) => {
    onNavigate(`editar-vocab-${vocab.vocab_id}`);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setWord("");
    setDefinition("");
    setTranslation("");
    setCategory("");
    setUsage("");
    setPronunciation("");
    setError("");
  };

  const handleSave = async () => {
    if (!word.trim()) {
      setError("La palabra es obligatoria");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const url = editingId
        ? `http://localhost:3000/api/vocabulary/${editingId}`
        : "http://localhost:3000/api/vocabulary";

      const method = editingId ? "PUT" : "POST";

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

      await fetchPrefsAndVocabulary();
      closeForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (vocabId) => {
    if (!window.confirm("¿Eliminar esta palabra?")) return;

    setDeleting(vocabId);
    try {
      await fetch(`http://localhost:3000/api/vocabulary/${vocabId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setVocabulary((prev) => prev.filter((v) => v.vocab_id !== vocabId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const truncate = (str, maxLen) => {
    if (!str) return "";
    return str.length > maxLen ? str.substring(0, maxLen) + "..." : str;
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.35)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.5)",
    color: "var(--text-primary)",
  };

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

      <section className="px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col">
          <h2
            className="text-2xl sm:text-3xl font-bold text-center mt-10 mb-8"
            style={{
              background:
                "linear-gradient(to right, var(--text-primary), var(--text-secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Lista de vocabulario
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-stretch sm:items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar palabra..."
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none"
                style={inputStyle}
              />
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                style={{ color: "var(--text-muted)" }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>

            <button
              onClick={openAddForm}
              className="px-8 py-4 font-semibold text-base sm:text-lg rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl shadow-lg whitespace-nowrap"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.50)",
                boxShadow: "0 4px 24px rgba(255, 255, 255, 0.10)",
                color: "var(--text-primary)",
              }}
            >
              Agregar una nueva palabra
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <GlassCard className="px-10 py-8 shadow-2xl">
                <p
                  className="text-lg font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Cargando...
                </p>
              </GlassCard>
            </div>
          ) : filteredVocabulary.length === 0 ? (
            <div className="flex justify-center py-20">
              <GlassCard className="px-10 py-10 shadow-2xl text-center max-w-md">
                <p
                  className="text-lg font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {searchQuery
                    ? "No se encontraron palabras"
                    : "Aún no tienes palabras"}
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {searchQuery
                    ? "Intenta con otra búsqueda"
                    : "Agrega tu primera palabra con el botón de arriba"}
                </p>
              </GlassCard>
            </div>
          ) : (
            <GlassCard className="p-6 shadow-2xl overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className="border-b"
                    style={{ borderColor: "var(--glass-border)" }}
                  >
                    <th
                      className="text-left py-3 px-4 font-semibold"
                      style={{
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Palabra
                    </th>
                    <th
                      className="text-left py-3 px-4 font-semibold"
                      style={{
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Definición
                    </th>
                    <th
                      className="text-left py-3 px-4 font-semibold"
                      style={{
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Traducción
                    </th>
                    <th
                      className="text-left py-3 px-4 font-semibold"
                      style={{
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Categoría
                    </th>
                    <th
                      className="text-left py-3 px-4 font-semibold"
                      style={{
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Uso
                    </th>
                    <th
                      className="text-left py-3 px-4 font-semibold"
                      style={{
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Pronunciación
                    </th>
                    <th
                      className="text-right py-3 px-4 font-semibold"
                      style={{
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVocabulary.map((vocab) => (
                    <tr
                      key={vocab.vocab_id}
                      className="border-b transition-colors"
                      style={{ borderColor: "var(--glass-border)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.15)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td
                        className="py-3 px-4 font-medium"
                        style={{
                          color: "var(--text-primary)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {vocab.word}
                      </td>
                      <td
                        className="py-3 px-4"
                        style={{
                          color: "var(--text-primary)",
                          fontSize: "0.875rem",
                          opacity: 0.85,
                        }}
                      >
                        {truncate(vocab.definition, 40)}
                      </td>
                      <td
                        className="py-3 px-4"
                        style={{
                          color: "var(--text-primary)",
                          fontSize: "0.875rem",
                          opacity: 0.85,
                        }}
                      >
                        {truncate(vocab.translation, 40)}
                      </td>
                      <td
                        className="py-3 px-4"
                        style={{
                          color: "var(--text-primary)",
                          fontSize: "0.875rem",
                          opacity: 0.8,
                        }}
                      >
                        {vocab.category || "—"}
                      </td>
                      <td
                        className="py-3 px-4"
                        style={{
                          color: "var(--text-primary)",
                          fontSize: "0.875rem",
                          opacity: 0.8,
                        }}
                      >
                        {vocab.usage || "—"}
                      </td>
                      <td
                        className="py-3 px-4 font-mono"
                        style={{
                          color: "var(--text-primary)",
                          fontSize: "0.875rem",
                          opacity: 0.8,
                        }}
                      >
                        {vocab.pronunciation || "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openEditForm(vocab)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: "var(--text-primary)" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(255,255,255,0.20)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                            title="Editar"
                          >
                            <svg
                              width="18"
                              height="18"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(vocab.vocab_id)}
                            disabled={deleting === vocab.vocab_id}
                            className="p-2 rounded-lg transition-colors disabled:opacity-50"
                            style={{ color: "var(--text-primary)" }}
                            onMouseEnter={(e) =>
                              !deleting &&
                              (e.currentTarget.style.background =
                                "rgba(255,255,255,0.20)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                            title="Eliminar"
                          >
                            <svg
                              width="18"
                              height="18"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          )}
        </div>
      </section>
    </div>
  );
};

export default Vocabulario;
