import { useState } from "react";
import GlassCard from "./GlassCard";

const Navbar = ({ links = [] }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="pt-8 pb-4 px-4 sm:px-8 relative z-10">
      <GlassCard className="max-w-6xl mx-auto px-5 sm:px-8 py-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-semibold font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Writing Practice
          </h1>

          {/* Desktop nav */}
          <div className="hidden sm:flex gap-2">
            {links.map((link, i) => (
              <button
                key={i}
                onClick={link.onClick}
                className="px-5 py-2 rounded-xl font-medium text-gray-700 transition-all"
                style={{ transition: 'background 0.2s, color 0.2s' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.35)';
                  e.currentTarget.style.backdropFilter = 'blur(12px)';
                  e.currentTarget.style.WebkitBackdropFilter = 'blur(12px)';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(255,255,255,0.20)';
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.50)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.backdropFilter = 'none';
                  e.currentTarget.style.WebkitBackdropFilter = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.border = '1px solid transparent';
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden flex flex-col mt-3 pt-3 border-t border-white/40 gap-1">
            {links.map((link, i) => (
              <button
                key={i}
                onClick={() => { setMenuOpen(false); link.onClick?.(); }}
                className="w-full text-left px-3 py-2.5 text-gray-700 font-medium rounded-xl transition-all hover:bg-white/30"
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </GlassCard>
    </nav>
  );
};

export default Navbar;