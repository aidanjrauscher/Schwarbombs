import { useState, useEffect } from 'react'
import { fetchSeasonHomeRuns } from './api'

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })
}

function BaseDiamond({ runnersOn }) {
  const on = base => runnersOn?.includes(base)

  const Base = ({ active }) => (
    <div className={`w-3 h-3 rotate-45 ${active ? 'bg-yellow-400' : 'bg-white/20'}`} />
  )

  return (
    <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl px-3 py-2">
      <div className="relative w-9 h-9 shrink-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2"><Base active={on('2B')} /></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2"><Base active={on('3B')} /></div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2"><Base active={on('1B')} /></div>
      </div>
      <span className="text-white/50 text-xs uppercase tracking-widest mt-0.5">Runners</span>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl px-3 py-2">
      <span className="text-white text-sm sm:text-base font-bold leading-tight">{value ?? '—'}</span>
      <span className="text-white/50 text-xs uppercase tracking-widest mt-0.5">{label}</span>
    </div>
  )
}

function OutsStat({ outs }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl px-3 py-2">
      <div className="flex gap-1.5 items-center h-5 sm:h-6">
        {[0, 1].map(i => (
          <div
            key={i}
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 ${
              i < outs ? 'bg-white border-white' : 'bg-transparent border-white/40'
            }`}
          />
        ))}
      </div>
      <span className="text-white/50 text-xs uppercase tracking-widest mt-0.5">Outs</span>
    </div>
  )
}

function SprayChart({ coordX, coordY }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl px-3 py-2">
      <svg viewBox="-10 20 270 195" className="w-10 h-10 sm:w-12 sm:h-12 shrink-0">
        {/* Outfield */}
        <path d="M 125 205 L 5 85 A 170 170 0 0 1 245 85 Z" fill="#166534" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.2" />
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

function HRCard({ hr, number }) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="bg-[#e81828] text-white text-sm font-black rounded-full w-8 h-8 flex items-center justify-center shrink-0">
            {number}
          </span>
          {hr.opponentId && (
            <img
              src={`https://www.mlbstatic.com/team-logos/team-cap-on-dark/${hr.opponentId}.svg`}
              alt={hr.opponent}
              className="w-8 h-8 object-contain shrink-0"
            />
          )}
          <div>
            <p className="font-bold text-sm sm:text-base leading-tight">
              {hr.isHome ? 'vs' : 'at'} {hr.opponent}
            </p>
            <p className="text-white/50 text-xs">{formatDate(hr.date)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/70 text-xs uppercase tracking-widest">
            {hr.halfInning === 'top' ? '▲' : '▼'} {hr.inning}
          </p>
          {hr.rbi > 1 && (
            <p className="text-[#e81828] text-xs font-bold">
              {hr.rbi === 4 ? 'Grand Slam' : `${hr.rbi}-run HR`}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        <Stat label="Distance" value={hr.distance ? `${hr.distance} ft` : null} />
        <SprayChart coordX={hr.hitX} coordY={hr.hitY} />
        <Stat label="Count" value={hr.balls != null && hr.strikes != null ? `${hr.balls}-${hr.strikes}` : null} />
        <BaseDiamond runnersOn={hr.runnersOn} />
        <OutsStat outs={hr.outs ?? 0} />
      </div>
    </div>
  )
}

export default function HomeRunList({ season, onBack }) {
  const [homeRuns, setHomeRuns] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSeasonHomeRuns(season)
      .then(setHomeRuns)
      .catch(() => setError('Failed to load home run data'))
  }, [])

  return (
    <main className="min-h-screen flex flex-col bg-[#001f5b] text-white px-4 py-10">
      <div className="w-full max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="text-white/60 hover:text-white text-sm font-semibold tracking-widest uppercase mb-6 flex items-center gap-2 transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1">Home Runs</h1>
        <p className="text-[#e81828] text-base font-semibold tracking-widest uppercase mb-8">
          Kyle Schwarber · {season}
        </p>

        {error && <p className="text-red-400">{error}</p>}

        {!homeRuns && !error && (
          <p className="text-gray-400 animate-pulse">Loading home runs...</p>
        )}

        {homeRuns && (
          <div className="flex flex-col gap-3">
            {homeRuns.map((hr, i) => (
              <HRCard key={i} hr={hr} number={homeRuns.length - i} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
