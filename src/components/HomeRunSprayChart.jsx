function HomeRunSprayChart({ coordX, coordY }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl px-3 py-2">
      <svg viewBox="-10 20 270 195" className="w-10 h-10 sm:w-12 sm:h-12 shrink-0">
        {/* Outfield */}
        <path d="M 125 205 L 5 85 A 140 140 0 0 1 245 85 Z" fill="#166534" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.2" />
        {/* Infield — proper square diamond: home(125,205), 1B(182,148), 2B(125,92), 3B(68,148) */}
        <path d="M 125 205 L 182 148 L 125 92 L 68 148 Z" fill="#92400e" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.2" />
        {/* Bases */}
        <rect x="119" y="86" width="12" height="12" fill="white" fillOpacity="0.6" transform="rotate(45 125 92)" />
        <rect x="176" y="142" width="12" height="12" fill="white" fillOpacity="0.6" transform="rotate(45 182 148)" />
        <rect x="62" y="142" width="12" height="12" fill="white" fillOpacity="0.6" transform="rotate(45 68 148)" />
        {/* HR dot */}
        {coordX != null && coordY != null && (
          <circle cx={coordX} cy={coordY} r="8" fill="#e81828" stroke="white" strokeWidth="1.5" />
        )}
        {coordX == null && (
          <text x="125" y="155" textAnchor="middle" fill="white" fillOpacity="0.3" fontSize="20">?</text>
        )}
      </svg>
      <span className="text-white/50 text-xs uppercase tracking-widest mt-0.5">Direction</span>
    </div>
  )
}

export default HomeRunSprayChart
