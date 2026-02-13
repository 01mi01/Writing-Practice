const GlassCard = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white/40 backdrop-blur-2xl rounded-3xl shadow-lg border border-white/60 ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
