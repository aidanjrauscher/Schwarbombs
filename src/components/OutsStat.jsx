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

export default OutsStat
