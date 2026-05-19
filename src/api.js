const PLAYER_ID = 656941
const TEAM_ID = 143

export function getSeason() {
  const now = new Date()
  const year = now.getFullYear()
  const cutoff = new Date(year, 2, 15) // March 15
  return now < cutoff ? year - 1 : year 
}

function getToday(year) {
  const d = new Date()
  const yyyy = year ?? d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export async function fetchAllStats(season) {
  const today = getToday(season)
  const [playerData, teamData, careerData, scheduleData] = await Promise.all([
    fetch(`https://statsapi.mlb.com/api/v1/people/${PLAYER_ID}/stats?stats=season&group=hitting&season=${season}`).then(r => r.json()),
    fetch(`https://statsapi.mlb.com/api/v1/teams/${TEAM_ID}/stats?stats=season&group=hitting&season=${season}`).then(r => r.json()),
    fetch(`https://statsapi.mlb.com/api/v1/people/${PLAYER_ID}/stats?stats=career&group=hitting`).then(r => r.json()),
    fetch(`https://statsapi.mlb.com/api/v1/schedule?teamId=${TEAM_ID}&date=${today}&sportId=1&gameType=R,F,D,L,W`).then(r => r.json()),
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
    `https://statsapi.mlb.com/api/v1/people/${PLAYER_ID}/stats?stats=gameLog&group=hitting&season=${season}&gameType=R,F,D,L,W`
  ).then(r => r.json())
  const splits = gameLogData?.stats?.[0]?.splits ?? []

  const todayHR = gamePks.reduce((total, pk) => {
    const split = splits.find(s => s.game?.gamePk === pk)
    return total + (split?.stat?.homeRuns ?? 0)
  }, 0)

  return { stats, teamGamesPlayed, careerHR, todayHR, noGameToday: false }
}

const LOCATION_MAP = {
  '7': 'Left Field', '78': 'Left-Center', '8': 'Center Field',
  '89': 'Right-Center', '9': 'Right Field',
}

export async function fetchSeasonHomeRuns(season) {
  const gameLogData = await fetch(
    `https://statsapi.mlb.com/api/v1/people/${PLAYER_ID}/stats?stats=gameLog&group=hitting&season=${season}`
  ).then(r => r.json())

  const splits = gameLogData?.stats?.[0]?.splits ?? []
  const gamesWithHR = splits.filter(s => s.stat?.homeRuns > 0)

  const feeds = await Promise.all(
    gamesWithHR.map(s =>
      fetch(`https://statsapi.mlb.com/api/v1.1/game/${s.game.gamePk}/feed/live`)
        .then(r => r.json())
        .then(feed => ({ feed, split: s }))
    )
  )

  const homeRuns = []

  for (const { feed, split } of feeds) {
    const allPlays = feed?.liveData?.plays?.allPlays ?? []
    const gameData = feed?.gameData
    const isHome = gameData?.teams?.home?.id === TEAM_ID
    const opponentTeam = isHome ? gameData?.teams?.away : gameData?.teams?.home
    const opponent = opponentTeam?.name
    const opponentId = opponentTeam?.id

    const hrPlays = allPlays.filter(
      p => p.result?.eventType === 'home_run' && p.matchup?.batter?.id === PLAYER_ID
    )

    const lastPlayIndex = allPlays[allPlays.length - 1]?.atBatIndex

    for (const play of hrPlays) {
      const pitchEvents = (play.playEvents ?? []).filter(e => e.isPitch)
      const lastPitch = pitchEvents[pitchEvents.length - 1]
      const hitData = lastPitch?.hitData

      const runnersOn = (play.runners ?? [])
        .filter(r => r.movement?.originBase != null && r.details?.runner?.id !== PLAYER_ID)
        .map(r => r.movement.originBase)

      homeRuns.push({
        date: split.date,
        opponent,
        opponentId,
        isHome,
        inning: play.about?.inning,
        halfInning: play.about?.halfInning,
        outs: play.count?.outs,
        pitchCount: pitchEvents.length,
        distance: hitData?.totalDistance ? Math.round(hitData.totalDistance) : null,
        direction: LOCATION_MAP[String(hitData?.location)] ?? null,
        hitX: hitData?.coordinates?.coordX ?? null,
        hitY: hitData?.coordinates?.coordY ?? null,
        runnersOn,
        balls: lastPitch?.count?.balls,
        strikes: lastPitch?.count?.strikes,
        rbi: play.result?.rbi,
        scoreHome: play.result?.homeScore ?? null,
        scoreAway: play.result?.awayScore ?? null,
        isWalkoff: play.atBatIndex === lastPlayIndex && play.about?.halfInning === 'bottom',
      })
    }
  }

  return homeRuns.sort((a, b) => new Date(b.date) - new Date(a.date))
}
