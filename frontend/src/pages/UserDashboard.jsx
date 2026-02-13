import { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import Navbar from "../components/Navbar";
import BackgroundStatic from "../components/BackgroundStatic";

const UserDashboard = ({ onNavigate, onLogout }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const navLinks = [
    { label: "Dashboard", onClick: () => onNavigate("user-dashboard") },
    { label: "Textos", onClick: () => {} },
    { label: "Vocabulario", onClick: () => {} },
    { label: "Preferencias", onClick: () => {} },
    { label: "Cerrar sesión", onClick: onLogout },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-100 relative overflow-hidden">
      <BackgroundStatic />
      <Navbar links={navLinks} />

      <section className="px-4 sm:px-8 py-12 sm:py-20 relative z-10">
        <GlassCard className="max-w-6xl mx-auto px-8 sm:px-12 py-10 sm:py-14 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-10 text-center">
            Dashboard de Usuario
          </h2>

          {user && (
            <div className="text-center">
              <p className="text-lg text-gray-700">
                Bienvenido, <span className="font-semibold">{user.username}</span>
              </p>
            </div>
          )}
        </GlassCard>
      </section>
    </div>
  );
};

export default UserDashboard;