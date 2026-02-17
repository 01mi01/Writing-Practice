import GlassCard from "../components/GlassCard";
import Navbar from "../components/Navbar";
import BackgroundAnimated from "../components/BackgroundAnimated";
import { useEffect } from "react";
import { applyTheme } from "../utils/applyTheme";

const Landing = ({ onNavigate }) => {
  useEffect(() => {
    applyTheme("light", "cold");
  }, []);

  const navLinks = [
    { label: "Inicio", onClick: () => onNavigate("landing") },
    { label: "Registrarse", onClick: () => onNavigate("register") },
    { label: "Iniciar sesión", onClick: () => onNavigate("login") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-100 relative overflow-hidden">
      <BackgroundAnimated />

      <Navbar links={navLinks} activePage="Inicio" />

      {/* Hero Section */}
      <section className="px-4 sm:px-8 py-12 sm:py-20 relative z-10">
        <GlassCard className="max-w-4xl mx-auto px-8 sm:px-16 py-14 sm:py-20 text-center shadow-2xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6 sm:mb-8 leading-tight pb-2">
            Desarrolla tus habilidades de escritura en inglés
          </h2>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8 sm:mb-10 max-w-2xl mx-auto">
            Writing Practice es una plataforma diseñada para estudiantes de
            inglés de nivel intermedio y avanzado que desean mantener y mejorar
            sus habilidades de escritura a través de la práctica constante,
            retroalimentación personalizada y seguimiento de su progreso.
          </p>
          <button
            onClick={() => onNavigate("register")}
            className="px-8 py-4 text-gray-700 font-semibold text-base sm:text-lg rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl shadow-lg"
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.50)",
              boxShadow: "0 4px 24px rgba(255, 255, 255, 0.10)",
            }}
          >
            Comenzar ahora
          </button>
        </GlassCard>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-8 py-8 sm:py-16 pb-24 sm:pb-32 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-8 sm:mb-12">
            Funcionalidades
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <GlassCard className="p-7 sm:p-8 hover:shadow-2xl transition-all hover:scale-105 shadow-xl">
              <h4 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">
                Panel de seguimiento
              </h4>
              <p className="text-gray-700 leading-relaxed">
                Visualiza tu progreso con gráficos y estadísticas detalladas.
                Consulta tu racha de escritura, frecuencia de práctica y mejora
                continua.
              </p>
            </GlassCard>

            <GlassCard className="p-7 sm:p-8 hover:shadow-2xl transition-all hover:scale-105 shadow-xl">
              <h4 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">
                Retroalimentación
              </h4>
              <p className="text-gray-700 leading-relaxed">
                Practica escribiendo y recibe retroalimentación inmediata sobre
                la cantidad de errores ortográficos, el uso de conectores
                avanzados y palabras de tu lista de vocabulario personal.
              </p>
            </GlassCard>

            <GlassCard className="p-7 sm:p-8 hover:shadow-2xl transition-all hover:scale-105 shadow-xl">
              <h4 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">
                Vocabulario
              </h4>
              <p className="text-gray-700 leading-relaxed">
                Crea y gestiona tu propia lista de palabras. Amplía tu
                vocabulario y consulta su uso a través de métricas detalladas.
              </p>
            </GlassCard>

            <GlassCard className="p-7 sm:p-8 hover:shadow-2xl transition-all hover:scale-105 shadow-xl">
              <h4 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">
                Interfaz personalizable
              </h4>
              <p className="text-gray-700 leading-relaxed">
                Personaliza la apariencia de la aplicación seleccionando un tema
                claro u oscuro y paletas de colores que se ajusten a tu estilo.
              </p>
            </GlassCard>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
