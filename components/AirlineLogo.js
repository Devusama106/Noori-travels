export default function AirlineLogo({ name, code, logoUrl, size = 40 }) {
  const dim = { width: size, height: size };
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name || "Airline logo"}
        style={dim}
        className="rounded-full object-contain bg-white border border-black/5 shrink-0"
      />
    );
  }
  return (
    <div
      style={dim}
      className="rounded-full bg-noori-primary-light flex items-center justify-center text-noori-primary font-bold shrink-0"
    >
      <span style={{ fontSize: Math.max(size * 0.32, 10) }}>
        {(code || name || "").slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}
