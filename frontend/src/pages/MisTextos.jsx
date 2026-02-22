import { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import Navbar from "../components/Navbar";
import BackgroundAnimated from "../components/BackgroundAnimated";
import { applyTheme } from "../utils/applyTheme";

const btnStyle = {
  background: "var(--glass-bg)",
  backdropFilter: "var(--glass-blur)",
  WebkitBackdropFilter: "var(--glass-blur)",
  border: "1px solid var(--glass-border)",
  boxShadow: "var(--glass-shadow)",
  color: "var(--text-primary)",
};

const MisTextos = ({ onNavigate, onLogout }) => {
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const navLinks = [
    { label: "Inicio", onClick: () => onNavigate("user-dashboard") },
    { label: "Mis textos", onClick: () => onNavigate("mis-textos") },
    { label: "Vocabulario", onClick: () => onNavigate("vocabulario") },
    { label: "Personalizar", onClick: () => onNavigate("preferences") },
    { label: "Cerrar sesión", onClick: onLogout },
  ];

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPrefsAndTexts = async () => {
      try {
        const [prefsRes, textsRes] = await Promise.all([
          fetch("http://localhost:3000/api/preferences", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3000/api/texts", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const prefs = await prefsRes.json();
        const textsData = await textsRes.json();
        applyTheme(
          prefs?.theme?.theme_name ?? "light",
          prefs?.color?.color_name ?? "cold",
        );
        setTexts(textsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrefsAndTexts();
  }, []);

  const handleDelete = async (textId) => {
    if (!window.confirm("¿Eliminar esta entrada?")) return;
    setDeleting(textId);
    try {
      await fetch(`http://localhost:3000/api/texts/${textId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTexts((prev) => prev.filter((t) => t.text_id !== textId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const fmtDate = (val) =>
    new Date(val).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div
      className="min-h-screen relative overflow-hidden pb-16"
      style={{
        background:
          "linear-gradient(135deg, var(--bg-gradient-from), var(--bg-gradient-via), var(--bg-gradient-to))",
      }}
    >
      <BackgroundAnimated />
      <Navbar links={navLinks} activePage="Mis textos" />

      <section className="px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col">
          {/* Title */}
          <h2
            className="text-2xl sm:text-3xl font-bold text-center mt-10 mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Mis entradas de texto
          </h2>

          {/* Action buttons */}
          <div className="flex gap-3 justify-center mb-10">
            <button
              onClick={() => onNavigate("nueva-entrada")}
              className="px-7 py-3 font-semibold text-base rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl"
              style={btnStyle}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--glass-border)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--glass-bg)")
              }
            >
              Nueva entrada
            </button>
            <button
              onClick={() => onNavigate("vocabulario")}
              className="px-7 py-3 font-semibold text-base rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl"
              style={btnStyle}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--glass-border)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--glass-bg)")
              }
            >
              Vocabulario
            </button>
          </div>

          {/* Content */}
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
          ) : texts.length === 0 ? (
            <div className="flex justify-center py-20">
              <GlassCard className="px-10 py-10 shadow-2xl text-center max-w-md">
                <p
                  className="text-lg font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Aún no tienes entradas
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Crea tu primera entrada con el botón de arriba.
                </p>
              </GlassCard>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {texts.map((text) => (
                <GlassCard
                  key={text.text_id}
                  className="p-6 shadow-xl flex flex-col gap-4"
                >
                  {/* Header: title + type badge */}
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-sm font-semibold leading-snug"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <span
                        style={{ color: "var(--text-muted)", fontWeight: 400 }}
                      >
                        Título:{" "}
                      </span>
                      {text.title}
                    </p>
                    {text.textType?.type_name && (
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-xl shrink-0"
                        style={{
                          background: "var(--glass-bg)",
                          backdropFilter: "var(--glass-blur)",
                          WebkitBackdropFilter: "var(--glass-blur)",
                          border: "1px solid var(--glass-border)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {text.textType.type_name}
                      </span>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="flex flex-col gap-1">
                    {[
                      { label: "Palabras escritas", value: text.word_count },
                      {
                        label: "Conectores avanzados utilizados",
                        value: text.advanced_connectors_count,
                      },
                      {
                        label: "Palabras de la lista de vocabulario",
                        value: text.vocab_words_used,
                      },
                      {
                        label: "Errores ortográficos",
                        value: text.spelling_errors,
                      },
                    ].map((m) => (
                      <p
                        key={m.label}
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <span style={{ color: "var(--text-muted)" }}>
                          {m.label}:{" "}
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {m.value ?? 0}
                        </span>
                      </p>
                    ))}
                  </div>

                  {/* Dates */}
                  <div className="flex flex-col gap-1">
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Fecha de creación:{" "}
                      <span style={{ color: "var(--text-secondary)" }}>
                        {fmtDate(text.created_at)}
                      </span>
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Última modificación:{" "}
                      <span style={{ color: "var(--text-secondary)" }}>
                        {fmtDate(text.updated_at)}
                      </span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-2">
                    <button
                      onClick={() => onNavigate(`editar-texto-${text.text_id}`)}
                      className="flex-1 py-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105 hover:shadow-xl"
                      style={{
                        background: "var(--glass-bg)",
                        backdropFilter: "var(--glass-blur)",
                        WebkitBackdropFilter: "var(--glass-blur)",
                        border: "1px solid var(--glass-border)",
                        boxShadow: "var(--glass-shadow)",
                        color: "var(--text-primary)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--glass-border)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "var(--glass-bg)")
                      }
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(text.text_id)}
                      disabled={deleting === text.text_id}
                      className="flex-1 py-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105 hover:shadow-xl"
                      style={{
                        background: "var(--glass-bg)",
                        backdropFilter: "var(--glass-blur)",
                        WebkitBackdropFilter: "var(--glass-blur)",
                        border: "1px solid var(--glass-border)",
                        boxShadow: "var(--glass-shadow)",
                        color:
                          deleting === text.text_id
                            ? "var(--text-muted)"
                            : "var(--text-primary)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--glass-border)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "var(--glass-bg)")
                      }
                    >
                      {deleting === text.text_id ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MisTextos;
