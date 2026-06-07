import { useState, useEffect } from 'react'
import { getSeason, fetchAllStats } from './api'
import HomeRunList from './components/HomeRunList'
import { Analytics } from '@vercel/analytics/react'

function App() {
  const [showHRList, setShowHRList] = useState(false)
  const [stats, setStats] = useState(null)
  const [teamGamesPlayed, setTeamGamesPlayed] = useState(null)
  const [careerHR, setCareerHR] = useState(null)
  const [todayHR, setTodayHR] = useState(null)
  const [noGameToday, setNoGameToday] = useState(false)
  const [hrRank, setHrRank] = useState(null)
  const [error, setError] = useState(null)

  const currentSeason = getSeason()
  const [season, setSeason] = useState(currentSeason)
  const MIN_SEASON = 2022

  useEffect(() => {
    setStats(null)
    setError(null)
    fetchAllStats(season)
      .then(data => {
        if (data.stats) setStats(data.stats)
        else setError('No player stats found')
        setTeamGamesPlayed(data.teamGamesPlayed)
        setCareerHR(data.careerHR)
        setTodayHR(data.todayHR)
        setNoGameToday(data.noGameToday)
        setHrRank(data.hrRank)
      })
      .catch(() => setError('Failed to fetch stats'))
  }, [season])

  const ordinal = n => {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
  }

  const projectedHR = stats && teamGamesPlayed
    ? Math.floor(stats.homeRuns * (162 / teamGamesPlayed))
    : null

  const seasonLabel = season === currentSeason
    ? String(season)
    : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        .replace(String(new Date().getFullYear()), String(season))

  if (showHRList) return <HomeRunList season={season} onBack={() => setShowHRList(false)} />

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#001f5b] text-white px-4 py-10">
      <Analytics />
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Schwarbomb Tracker</h1>
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => setSeason(s => s - 1)}
          disabled={season <= MIN_SEASON}
          className="text-[#e81828] font-bold text-lg leading-none disabled:opacity-20 hover:opacity-70 transition-opacity"
        >‹</button>
        <p className="text-[#e81828] text-base sm:text-lg font-semibold tracking-widest uppercase">Philadelphia Phillies · {season}</p>
        <button
          onClick={() => setSeason(s => s + 1)}
          disabled={season >= currentSeason}
          className="text-[#e81828] font-bold text-lg leading-none disabled:opacity-20 hover:opacity-70 transition-opacity"
        >›</button>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      {!stats && !error && (
        <p className="text-gray-400 animate-pulse">Loading stats...</p>
      )}

      {stats && (
        <div className="flex flex-col gap-4 w-full max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            <div className="flex flex-col items-center bg-[#e81828] rounded-2xl px-8 py-6 shadow-lg">
              <span className="text-7xl sm:text-9xl font-black leading-none">{stats.homeRuns}</span>
              <span className="text-base sm:text-xl font-semibold mt-2 tracking-widest uppercase">Home Runs</span>
              <p className="text-white/60 text-sm mt-2">{stats.gamesPlayed} games played</p>
              {hrRank && <p className="text-white/60 text-sm mt-1">{ordinal(hrRank)} in MLB</p>}
            </div>

            <div className="flex flex-col items-center bg-[#7c3aed] rounded-2xl px-8 py-6 shadow-lg">
              <span className="text-7xl sm:text-9xl font-black leading-none">
                {projectedHR ?? '—'}
              </span>
              <span className="text-base sm:text-xl font-semibold mt-2 tracking-widest uppercase">Projected HR</span>
              <p className="text-white/60 text-sm mt-2">162-game pace</p>
            </div>

            <div className="flex flex-col items-center bg-[#059669] rounded-2xl px-8 py-6 shadow-lg">
              {noGameToday ? (
                <>
                  <span className="text-5xl sm:text-7xl font-black leading-none mb-4">—</span>
                  <span className="text-base sm:text-xl font-semibold mt-2 tracking-widest uppercase">Today's HR</span>
                  <p className="text-white/60 text-sm mt-2">{season !== currentSeason ? seasonLabel : 'No game today'}</p>
                </>
              ) : (
                <>
                  <span className="text-7xl sm:text-9xl font-black leading-none">
                    {todayHR ?? <span className="animate-pulse text-white/40">·</span>}
                  </span>
                  <span className="text-base sm:text-xl font-semibold mt-2 tracking-widest uppercase">Today's HR</span>
                  <p className="text-white/60 text-sm mt-2">{season !== currentSeason ? seasonLabel : <>&nbsp;</>}</p>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0.75 bg-white/30 rounded-2xl overflow-hidden shadow-lg">
            {[
              { label: 'BA',  value: stats.avg },
              { label: 'RBI', value: stats.rbi },
              { label: 'OBP', value: stats.obp },
              { label: 'OPS', value: stats.ops },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center bg-[#1e293b] py-4 px-2">
                <span className="text-2xl sm:text-4xl font-black leading-none">{value ?? '—'}</span>
                <span className="text-xs sm:text-sm font-semibold mt-1 tracking-widest uppercase text-white/60">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col bg-white/10 border border-white/20 rounded-2xl px-6 py-6 sm:px-12 sm:py-8 shadow-lg">
            <span className="text-base sm:text-xl font-semibold tracking-widest uppercase mb-4">Road to 500</span>
            <div className="flex items-end gap-3 mb-5">
              <span className="text-6xl sm:text-8xl font-black leading-none">{careerHR ?? '—'}</span>
              <span className="text-2xl sm:text-4xl font-bold text-white/40 mb-1">/ 500</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 sm:h-4 overflow-hidden">
              <div
                className="bg-[#e81828] h-full rounded-full transition-all duration-700"
                style={{ width: careerHR ? `${Math.min((careerHR / 500) * 100, 100)}%` : '0%' }}
              />
            </div>
            <p className="text-white/40 text-sm mt-2 text-right">{careerHR ? 500 - careerHR : '—'} to go</p>
          </div>

          <button
            onClick={() => setShowHRList(true)}
            className="text-white/50 hover:text-white text-sm font-semibold tracking-widest uppercase transition-colors text-center py-2"
          >
            Show individual home runs →
          </button>
        </div>
      )}
    </main>
  )
}

export default App
