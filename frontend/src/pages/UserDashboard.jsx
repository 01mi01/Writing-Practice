import { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import Navbar from "../components/Navbar";
import BackgroundStatic from "../components/BackgroundStatic";
import UserMetricsGrid from "../components/UserMetricsGrid";
import { applyTheme } from "../utils/applyTheme";

const btnStyle = {
  background: "rgba(255,255,255,0.15)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.50)",
  boxShadow: "0 4px 24px rgba(255,255,255,0.10)",
};

const UserDashboard = ({ onNavigate, onLogout }) => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const navLinks = [
    { label: "Inicio", onClick: () => onNavigate("user-dashboard") },
    { label: "Mis textos", onClick: () => onNavigate("mis-textos") },
    { label: "Vocabulario", onClick: () => onNavigate("vocabulario") },
    { label: "Personalizar", onClick: () => onNavigate("preferences") },
    { label: "Cerrar sesión", onClick: onLogout },
  ];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchAll = async () => {
      try {
        const [prefsRes, dashRes] = await Promise.all([
          fetch("http://localhost:3000/api/preferences", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3000/api/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const prefs = await prefsRes.json();
        const dash = await dashRes.json();

        applyTheme(
          prefs?.theme?.theme_name ?? "light",
          prefs?.color?.color_name ?? "cold",
        );

        setDashboardData(dash);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const summary = dashboardData?.summary;

  return (
    <div
      className="min-h-screen relative overflow-hidden pb-16"
      style={{
        background:
          "linear-gradient(135deg, var(--bg-gradient-from), var(--bg-gradient-via), var(--bg-gradient-to))",
      }}
    >
      <BackgroundStatic />
      <Navbar links={navLinks} activePage="Inicio" />

      <section className="px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-5 mt-10">
          {/* Hero welcome card */}
          <GlassCard className="px-8 sm:px-14 py-10 sm:py-14 shadow-2xl text-center flex flex-col items-center gap-8">
            {/* Welcome message — single line */}
            <div className="flex flex-wrap items-baseline justify-center gap-3">
              <p
                className="text-base sm:text-lg font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Bienvenido de nuevo,
              </p>
              <h2
                className="text-2xl sm:text-3xl font-bold"
                style={{
                  background:
                    "linear-gradient(to right, var(--text-primary), var(--text-secondary))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {user?.username ?? ""}
              </h2>
            </div>

            {/* 4 stat numbers */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
              {[
                {
                  label: "Palabras escritas",
                  value: summary?.total_words_written ?? 0,
                  unit: "",
                },
                {
                  label: "Vocabulario personal",
                  value: summary?.vocabulary_size ?? 0,
                  unit: "palabras",
                },
                {
                  label: "Racha actual",
                  value: summary?.current_streak ?? 0,
                  unit: "días",
                },
                {
                  label: "Racha más larga",
                  value: summary?.longest_streak ?? 0,
                  unit: "días",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col gap-1 items-center sm:items-start"
                >
                  <p
                    className="text-xs sm:text-sm font-medium text-center sm:text-left"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="font-bold"
                    style={{
                      color: "var(--text-primary)",
                      fontSize: "clamp(1.5rem, 3.5vw, 2.6rem)",
                      lineHeight: 1.1,
                    }}
                  >
                    {stat.value.toLocaleString("es-ES")}
                    {stat.unit && (
                      <span
                        className="text-sm font-medium ml-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {stat.unit}
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onNavigate("mis-textos")}
                className="px-8 py-3 font-semibold text-base rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl"
                style={{ ...btnStyle, color: "var(--text-primary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.30)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
                }
              >
                Nueva entrada
              </button>
              <button
                onClick={() => onNavigate("vocabulario")}
                className="px-8 py-3 font-semibold text-base rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl"
                style={{ ...btnStyle, color: "var(--text-primary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.30)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
                }
              >
                Vocabulario
              </button>
            </div>
          </GlassCard>

          {/* Section title */}
          <h3
            className="text-xl sm:text-2xl font-bold mt-4"
            style={{ color: "var(--text-primary)" }}
          >
            Panel de seguimiento
          </h3>

          {/* Metrics grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <GlassCard className="px-10 py-8 shadow-2xl">
                <p
                  className="text-lg font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Cargando...
                </p>
              </GlassCard>
            </div>
          ) : (
            <UserMetricsGrid data={dashboardData} />
          )}
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;
