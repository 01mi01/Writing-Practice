import { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import Navbar from "../components/Navbar";
import BackgroundAnimated from "../components/BackgroundAnimated";

const Register = ({ onNavigate }) => {
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2 fields
  const [birthDate, setBirthDate] = useState("2000-01-01");
  const [englishLevelId, setEnglishLevelId] = useState("");
  const [certificationTypeId, setCertificationTypeId] = useState("");
  const [certificationScore, setCertificationScore] = useState("");

  // Dynamic data from backend
  const [englishLevels, setEnglishLevels] = useState([]);
  const [certifications, setCertifications] = useState([]);

  const [error, setError] = useState("");

  const navLinks = [
    { label: "Inicio", onClick: () => onNavigate("landing") },
    { label: "Registrarse", onClick: () => onNavigate("register") },
    { label: "Iniciar sesión", onClick: () => onNavigate("login") },
  ];

  useEffect(() => {
    fetchEnglishLevels();
    fetchCertifications();
  }, []);

  const fetchEnglishLevels = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/english-levels");
      const data = await response.json();
      setEnglishLevels(data);
    } catch (err) {
      console.error("Error fetching English levels:", err);
    }
  };

  const fetchCertifications = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/certifications");
      const data = await response.json();
      setCertifications(data);
    } catch (err) {
      console.error("Error fetching certifications:", err);
    }
  };

  const handleStep1Continue = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/validate-step1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setStep(2);
    } catch (err) {
      setError("Error de conexión con el servidor");
      console.error(err);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          birth_date: birthDate,
          english_level_id: parseInt(englishLevelId),
          certification_type_id: certificationTypeId ? parseInt(certificationTypeId) : null,
          certification_score: certificationScore || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Error al registrarse");
        return;
      }

      console.log("Registro exitoso:", data);
      onNavigate("login");
    } catch (err) {
      setError("Error de conexión con el servidor");
      console.error(err);
    }
  };

  const step1Valid = username && email && password && confirmPassword && password === confirmPassword;
  const step2Valid = birthDate && englishLevelId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-100 relative overflow-hidden">
      <BackgroundAnimated />
      <Navbar links={navLinks} activePage="Registrarse" />

      <section className="px-4 sm:px-8 py-12 sm:py-20 relative z-10">
        <GlassCard className="max-w-md mx-auto px-8 sm:px-12 py-10 sm:py-14 shadow-2xl">
          {step === 1 ? (
            <>
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-10 text-center pb-2">
                Registrarse
              </h2>

              {error && (
                <div className="mb-6 p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleStep1Continue} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/60 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 backdrop-blur-sm"
                    placeholder="Usuario"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/60 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 backdrop-blur-sm"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/60 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 backdrop-blur-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar la contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/60 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 backdrop-blur-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!step1Valid}
                  className="w-full px-8 py-4 text-gray-800 font-semibold text-base sm:text-lg rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.50)",
                    boxShadow: "0 4px 24px rgba(255, 255, 255, 0.10)",
                  }}
                >
                  Continuar
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-6">
                ¿Ya tienes una cuenta?{" "}
                <button
                  onClick={() => onNavigate("login")}
                  className="font-semibold text-gray-800 hover:underline"
                >
                  Inicia Sesión
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-10 text-center pb-2">
                Completa tu perfil
              </h2>

              {error && (
                <div className="mb-6 p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleStep2Submit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de nacimiento
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/60 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400/50 backdrop-blur-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel de inglés
                  </label>
                  <select
                    value={englishLevelId}
                    onChange={(e) => setEnglishLevelId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/60 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400/50 backdrop-blur-sm"
                    required
                  >
                    <option value="">Seleccionar el nivel</option>
                    {englishLevels.map((level) => (
                      <option key={level.level_id} value={level.level_id}>
                        {level.level_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificación actual (opcional)
                  </label>
                  <select
                    value={certificationTypeId}
                    onChange={(e) => setCertificationTypeId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/60 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400/50 backdrop-blur-sm"
                  >
                    <option value="">Sin certificación</option>
                    {certifications.map((cert) => (
                      <option key={cert.certification_id} value={cert.certification_id}>
                        {cert.certification_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Puntaje o nivel obtenido (opcional)
                  </label>
                  <input
                    type="text"
                    value={certificationScore}
                    onChange={(e) => setCertificationScore(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/60 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 backdrop-blur-sm"
                    placeholder="Ej: 110, 7.5, B2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!step2Valid}
                  className="w-full px-8 py-4 text-gray-800 font-semibold text-base sm:text-lg rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.50)",
                    boxShadow: "0 4px 24px rgba(255, 255, 255, 0.10)",
                  }}
                >
                  Registrarse
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-6">
                ¿Ya tienes una cuenta?{" "}
                <button
                  onClick={() => onNavigate("login")}
                  className="font-semibold text-gray-800 hover:underline"
                >
                  Inicia Sesión
                </button>
              </p>
            </>
          )}
        </GlassCard>
      </section>
    </div>
  );
};

export default Register;