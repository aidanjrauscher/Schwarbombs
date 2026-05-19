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

export default BaseDiamond
