const PLAYER_ID = 656941
const TEAM_ID = 143

export function getSeason() {
  const now = new Date()
  const year = now.getFullYear()
  const cutoff = new Date(year, 2, 15) // March 15
  return now < cutoff ? year - 1 : year
}

function getToday() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export async function fetchAllStats(season) {
  const today = getToday()

  const [playerData, teamData, careerData, scheduleData] = await Promise.all([
    fetch(`https://statsapi.mlb.com/api/v1/people/${PLAYER_ID}/stats?stats=season&group=hitting&season=${season}`).then(r => r.json()),
    fetch(`https://statsapi.mlb.com/api/v1/teams/${TEAM_ID}/stats?stats=season&group=hitting&season=${season}`).then(r => r.json()),
    fetch(`https://statsapi.mlb.com/api/v1/people/${PLAYER_ID}/stats?stats=career&group=hitting`).then(r => r.json()),
    fetch(`https://statsapi.mlb.com/api/v1/schedule?teamId=${TEAM_ID}&date=${today}&sportId=1`).then(r => r.json()),
  ])

  const stats = playerData?.stats?.[0]?.splits?.[0]?.stat ?? null
  const teamGamesPlayed = teamData?.stats?.[0]?.splits?.[0]?.stat?.gamesPlayed ?? null
  const careerHR = careerData?.stats?.[0]?.splits?.[0]?.stat?.homeRuns ?? null

  const totalGames = scheduleData?.totalGames ?? 0
  const games = scheduleData?.dates?.[0]?.games ?? []

  if (totalGames === 0) {
    return { stats, teamGamesPlayed, careerHR, todayHR: null, noGameToday: true }
  }

  const gamePks = games.map(g => g.gamePk)
  const gameLogData = await fetch(
    `https://statsapi.mlb.com/api/v1/people/${PLAYER_ID}/stats?stats=gameLog&group=hitting&season=${season}`
  ).then(r => r.json())
  const splits = gameLogData?.stats?.[0]?.splits ?? []

  const todayHR = gamePks.reduce((total, pk) => {
    const split = splits.find(s => s.game?.gamePk === pk)
    return total + (split?.stat?.homeRuns ?? 0)
  }, 0)

  return { stats, teamGamesPlayed, careerHR, todayHR, noGameToday: false }
}
