const BackgroundAnimated = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden">
      {/* Blob 1 - bottom left */}
      <div
        className="blob-1 absolute rounded-full mix-blend-multiply"
        style={{
          width: "clamp(260px, 40vw, 700px)",
          height: "clamp(260px, 40vw, 700px)",
          bottom: "clamp(-14vh, -10vh, -6vh)",
          left: "clamp(-10vw, -5vw, -3vw)",
          background:
            "linear-gradient(to bottom right, var(--color-1-from), var(--color-1-to))",
          opacity: 0.35,
        }}
      />

      {/* Blob 2 - upper left */}
      <div
        className="
  blob-2 absolute rounded-full mix-blend-multiply
  bottom-[45vh] -left-20      /* phones + tablets */
  lg:top-[-90px] lg:left-[20%]
"
        style={{
          width: "clamp(240px, 26vw, 500px)",
          height: "clamp(240px, 26vw, 500px)",
          background:
            "linear-gradient(to bottom right, var(--color-2-from), var(--color-2-to))",
          opacity: 0.35,
        }}
      />

      {/* Blob 3 - lower center-right */}
      <div
        className="blob-3 absolute rounded-full mix-blend-multiply"
        style={{
          width: "clamp(220px, 50vw, 500px)",
          height: "clamp(220px, 50vw, 500px)",
          top: "clamp(44vh, 52vh, 58vh)",
          left: "clamp(36vw, 50vw, 56vw)",
          background:
            "linear-gradient(to bottom right, var(--color-3-from), var(--color-3-to))",
          opacity: 0.35,
        }}
      />

      {/* Blob 4 - upper right */}
      <div
        className="blob-4 absolute rounded-full mix-blend-multiply"
        style={{
          width: "clamp(220px, 32vw, 540px)",
          height: "clamp(220px, 32vw, 540px)",
          top: "clamp(-8vh, -4vh, -1vh)",
          right: "clamp(-6vw, -3vw, -1vw)",
          background:
            "linear-gradient(to bottom right, var(--color-4-from), var(--color-4-to))",
          opacity: 0.35,
        }}
      />
    </div>
  );
};

export default BackgroundAnimated;
