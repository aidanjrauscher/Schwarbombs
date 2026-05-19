import { useState, useEffect } from 'react'
import { fetchSeasonHomeRuns } from '../api'
import BaseDiamond from './BaseDiamond'
import OutsStat from './OutsStat'
import HomeRunSprayChart from './HomeRunSprayChart'

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })
}


function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl px-3 py-2">
      <span className="text-white text-sm sm:text-base font-bold leading-tight">{value ?? '—'}</span>
      <span className="text-white/50 text-xs uppercase tracking-widest mt-0.5">{label}</span>
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
          {hr.scoreHome != null && hr.scoreAway != null && (() => {
            const phillies = hr.isHome ? hr.scoreHome - hr.rbi : hr.scoreAway - hr.rbi
            const opp = hr.isHome ? hr.scoreAway : hr.scoreHome
            return <p className="text-white/50 text-xs">PHI {phillies} · OPP {opp}</p>
          })()}
          {hr.rbi > 1 && (
            <p className="text-[#e81828] text-xs font-bold">
              {hr.rbi === 4 ? 'Grand Slam' : `${hr.rbi}-run HR`}
            </p>
          )}
          {hr.isWalkoff && (
            <p className="text-yellow-400 text-xs font-bold">Walk-off</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        <Stat label="Distance" value={hr.distance ? `${hr.distance} ft` : null} />
        <HomeRunSprayChart coordX={hr.hitX} coordY={hr.hitY} />
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
