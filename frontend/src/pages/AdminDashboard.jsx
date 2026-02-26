import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import BackgroundStatic from "../components/BackgroundStatic";
import GlassCard from "../components/GlassCard";
import DashboardFilterBar from "../components/DashboardFilterBar";
import AdminMetricsGrid from "../components/MetricsGrid";
import { applyTheme } from "../utils/applyTheme";
import API_URL from "../utils/api";

const AdminDashboard = ({ onLogout }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [englishLevels, setEnglishLevels] = useState([]);
  const [certifications, setCertifications] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedCerts, setSelectedCerts] = useState([]);
  const [frequencyPeriod, setFrequencyPeriod] = useState("month");

  const navLinks = [
    { label: "Inicio", onClick: () => {} },
    { label: "Cerrar sesión", onClick: onLogout },
  ];

  const buildParams = (period, sd, ed, minA, maxA, levels, certs) => {
    const p = new URLSearchParams();
    p.set("frequencyPeriod", period);
    if (sd) p.set("startDate", sd);
    if (ed) p.set("endDate", ed);
    if (minA) p.set("minAge", minA);
    if (maxA) p.set("maxAge", maxA);
    if (levels.length) p.set("englishLevelIds", levels.join(","));
    if (certs.length) p.set("certificationIds", certs.join(","));
    return p.toString();
  };

  const fetchDashboardData = async (params) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/admin/dashboard?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyTheme("light", "cold");
    fetch(`${API_URL}/api/auth/english-levels`)
      .then((r) => r.json())
      .then(setEnglishLevels)
      .catch(console.error);
    fetch(`${API_URL}/api/auth/certifications`)
      .then((r) => r.json())
      .then((data) => {
        console.log("certs loaded:", data);
        setCertifications(data);
      })
      .catch(console.error);
    fetchDashboardData(buildParams("month", "", "", "", "", [], []));
  }, []);

  const handleApply = () => {
    fetchDashboardData(
      buildParams(
        frequencyPeriod,
        startDate,
        endDate,
        minAge,
        maxAge,
        selectedLevels,
        selectedCerts,
      ),
    );
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setMinAge("");
    setMaxAge("");
    setSelectedLevels([]);
    setSelectedCerts([]);
    setFrequencyPeriod("month");
    fetchDashboardData(buildParams("month", "", "", "", "", [], []));
  };

  return (
    <div
      className="min-h-screen relative pb-16"
      style={{
        background:
          "linear-gradient(135deg, var(--bg-gradient-from), var(--bg-gradient-via), var(--bg-gradient-to))",
      }}
    >
      <BackgroundStatic />
      <Navbar links={navLinks} activePage="Inicio" />

      <section className="px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 10 }}>
        <div className="max-w-7xl mx-auto flex flex-col">
          <h2
            className="text-2xl sm:text-3xl font-bold text-center mt-10 mb-10"
            style={{
              background:
                "linear-gradient(to right, var(--text-primary), var(--text-secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Métricas de desempeño de los usuarios
          </h2>

          <DashboardFilterBar
            englishLevels={englishLevels}
            certifications={certifications}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            minAge={minAge}
            setMinAge={setMinAge}
            maxAge={maxAge}
            setMaxAge={setMaxAge}
            selectedLevels={selectedLevels}
            setSelectedLevels={setSelectedLevels}
            selectedCerts={selectedCerts}
            setSelectedCerts={setSelectedCerts}
            frequencyPeriod={frequencyPeriod}
            setFrequencyPeriod={setFrequencyPeriod}
            onApply={handleApply}
            onReset={handleReset}
          />

          <div className="mt-10" />

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
            <AdminMetricsGrid metrics={metrics} />
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
