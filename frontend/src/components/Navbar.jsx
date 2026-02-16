import { useState } from "react";
import GlassCard from "./GlassCard";

const Navbar = ({ links = [], activePage = "" }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="pt-8 pb-4 px-4 sm:px-8 relative z-10">
      <GlassCard className="max-w-6xl mx-auto px-5 sm:px-8 py-4 shadow-xl">
        <div className="flex justify-between items-center">

          <h1
            className="text-xl sm:text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Writing Practice
          </h1>

          {/* Desktop nav */}
          <div className="hidden sm:flex gap-2">
            {links.map((link, i) => {
              const isActive = activePage && link.label === activePage;
              return (
                <button
                  key={i}
                  onClick={link.onClick}
                  className="px-5 py-2 rounded-xl transition-all"
                  style={{
                    fontWeight: isActive ? 700 : 500,
                    fontSize: isActive ? "0.9rem" : "0.875rem",
                    color: "var(--text-primary)",
                    border: "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.50)";
                    e.currentTarget.style.backdropFilter = "blur(16px)";
                    e.currentTarget.style.WebkitBackdropFilter = "blur(16px)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.60)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.backdropFilter = "none";
                    e.currentTarget.style.WebkitBackdropFilter = "none";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.border = "1px solid transparent";
                  }}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span
              className={`block w-6 h-0.5 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
              style={{ background: "var(--text-primary)" }}
            />
            <span
              className={`block w-6 h-0.5 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
              style={{ background: "var(--text-primary)" }}
            />
            <span
              className={`block w-6 h-0.5 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
              style={{ background: "var(--text-primary)" }}
            />
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden flex flex-col mt-3 pt-3 gap-1" style={{ borderTop: "1px solid var(--glass-border)" }}>
            {links.map((link, i) => {
              const isActive = activePage && link.label === activePage;
              return (
                <button
                  key={i}
                  onClick={() => { setMenuOpen(false); link.onClick?.(); }}
                  className="text-left px-3 py-2 rounded-xl transition-all"
                  style={{
                    fontWeight: isActive ? 700 : 500,
                    fontSize: isActive ? "0.9rem" : "0.875rem",
                    color: "var(--text-primary)",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.30)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  {link.label}
                </button>
              );
            })}
          </div>
        )}
      </GlassCard>
    </nav>
  );
};

export default Navbar;