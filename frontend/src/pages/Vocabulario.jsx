import { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import Navbar from "../components/Navbar";
import BackgroundStatic from "../components/BackgroundStatic";
import { applyTheme } from "../utils/applyTheme";

const btnStyle = {
  background: "var(--glass-bg)",
  backdropFilter: "var(--glass-blur)",
  WebkitBackdropFilter: "var(--glass-blur)",
  border: "1px solid var(--glass-border)",
  boxShadow: "var(--glass-shadow)",
  color: "var(--text-primary)",
};

const ConfirmModal = ({ word, onConfirm, onCancel }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center px-4"
    style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
  >
    <GlassCard className="px-8 py-8 shadow-2xl max-w-sm w-full flex flex-col gap-5 text-center">
      <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
        ¿Eliminar palabra?
      </p>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Se eliminará permanentemente{" "}
        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
          "{word}"
        </span>
        . Esta acción no se puede deshacer.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all transform hover:scale-105"
          style={btnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--glass-border)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--glass-bg)")}
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all transform hover:scale-105"
          style={btnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--glass-border)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--glass-bg)")}
        >
          Eliminar
        </button>
      </div>
    </GlassCard>
  </div>
);

const Vocabulario = ({ onNavigate, onLogout }) => {
  const [vocabulary, setVocabulary] = useState([]);
  const [filteredVocabulary, setFilteredVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const navLinks = [
    { label: "Inicio", onClick: () => onNavigate("user-dashboard") },
    { label: "Mis textos", onClick: () => onNavigate("mis-textos") },
    { label: "Vocabulario", onClick: () => onNavigate("vocabulario") },
    { label: "Personalizar", onClick: () => onNavigate("preferences") },
    { label: "Cerrar sesión", onClick: onLogout },
  ];

  const token = localStorage.getItem("token");

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

  const handleDeleteConfirmed = async () => {
    const { id } = confirmTarget;
    setConfirmTarget(null);
    setDeleting(id);
    try {
      await fetch(`http://localhost:3000/api/vocabulary/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setVocabulary((prev) => prev.filter((v) => v.vocab_id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const inputStyle = {
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-primary)",
  };

  const actionBtnStyle = {
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
      {confirmTarget && (
        <ConfirmModal
          word={confirmTarget.word}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmTarget(null)}
        />
      )}

      <BackgroundStatic />
      <Navbar links={navLinks} activePage="Vocabulario" />

      <section className="px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col">

          <h2
            className="text-2xl sm:text-3xl font-bold text-center mt-10 mb-8"
            style={{ color: "var(--text-primary)" }}
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
                className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--text-muted)" }}
              >
                <path d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" />
              </svg>
            </div>
            <button
              onClick={() => onNavigate("nueva-palabra")}
              className="px-5 py-3 font-semibold text-sm rounded-xl transition-all transform hover:scale-105 hover:shadow-2xl shadow-lg whitespace-nowrap"
              style={btnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--glass-border)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--glass-bg)")}
            >
              Agregar una nueva palabra
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <GlassCard className="px-10 py-8 shadow-2xl">
                <p className="text-lg font-medium" style={{ color: "var(--text-secondary)" }}>
                  Cargando...
                </p>
              </GlassCard>
            </div>
          ) : filteredVocabulary.length === 0 ? (
            <div className="flex justify-center py-20">
              <GlassCard className="px-10 py-10 shadow-2xl text-center max-w-md">
                <p className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  {searchQuery ? "No se encontraron palabras" : "Aún no tienes palabras"}
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {searchQuery ? "Intenta con otra búsqueda" : "Agrega tu primera palabra con el botón de arriba"}
                </p>
              </GlassCard>
            </div>
          ) : (
            <>
              {/* MOBILE — cards */}
              <div className="flex flex-col gap-4 lg:hidden">
                {filteredVocabulary.map((vocab) => (
                  <GlassCard key={vocab.vocab_id} className="p-5 shadow-xl flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                        {vocab.word}
                      </p>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => onNavigate(`editar-vocab-${vocab.vocab_id}`)}
                          className="p-2 rounded-lg transition-all"
                          style={actionBtnStyle}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--glass-border)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          title="Editar"
                        >
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setConfirmTarget({ id: vocab.vocab_id, word: vocab.word })}
                          disabled={deleting === vocab.vocab_id}
                          className="p-2 rounded-lg transition-all disabled:opacity-50"
                          style={actionBtnStyle}
                          onMouseEnter={(e) => !deleting && (e.currentTarget.style.background = "var(--glass-border)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          title="Eliminar"
                        >
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {vocab.definition && (
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        <span style={{ color: "var(--text-muted)" }}>Definición: </span>
                        {vocab.definition}
                      </p>
                    )}
                    {vocab.translation && (
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        <span style={{ color: "var(--text-muted)" }}>Traducción: </span>
                        {vocab.translation}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {vocab.category && (
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          Categoría: <span style={{ color: "var(--text-secondary)" }}>{vocab.category}</span>
                        </p>
                      )}
                      {vocab.usage && (
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          Uso: <span style={{ color: "var(--text-secondary)" }}>{vocab.usage}</span>
                        </p>
                      )}
                      {vocab.pronunciation && (
                        <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                          {vocab.pronunciation}
                        </p>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>

              {/* DESKTOP — table */}
              <GlassCard className="p-6 shadow-2xl hidden lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "var(--glass-border)" }}>
                      {["Palabra", "Definición", "Traducción", "Categoría", "Uso", "Pronunciación"].map((h) => (
                        <th key={h} className="text-left py-3 px-4 font-semibold"
                          style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>
                          {h}
                        </th>
                      ))}
                      <th className="text-right py-3 px-4 font-semibold"
                        style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>
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
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--glass-bg)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td className="py-3 px-4 font-medium" style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>
                          {vocab.word}
                        </td>
                        <td className="py-3 px-4" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                          {vocab.definition || "—"}
                        </td>
                        <td className="py-3 px-4" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                          {vocab.translation || "—"}
                        </td>
                        <td className="py-3 px-4" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                          {vocab.category || "—"}
                        </td>
                        <td className="py-3 px-4" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                          {vocab.usage || "—"}
                        </td>
                        <td className="py-3 px-4 font-mono" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                          {vocab.pronunciation || "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => onNavigate(`editar-vocab-${vocab.vocab_id}`)}
                              className="p-2 rounded-lg transition-all"
                              style={actionBtnStyle}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--glass-border)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                              title="Editar"
                            >
                              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setConfirmTarget({ id: vocab.vocab_id, word: vocab.word })}
                              disabled={deleting === vocab.vocab_id}
                              className="p-2 rounded-lg transition-all disabled:opacity-50"
                              style={actionBtnStyle}
                              onMouseEnter={(e) => !deleting && (e.currentTarget.style.background = "var(--glass-border)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                              title="Eliminar"
                            >
                              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Vocabulario;