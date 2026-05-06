import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function Leaderboard() {
  const [rows, setRows] = useState([])
  useEffect(() => {
    api.get('/leaderboard').then(r => setRows(r.data)).catch(()=>{})
  }, [])

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      <div className="text-center space-y-2">
        <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic">Hall of Shadows</h2>
        <div className="flex items-center justify-center gap-4">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-cyber-accent" />
          <p className="text-xs text-cyber-accent uppercase tracking-[0.4em] font-mono">Top Operatives</p>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-cyber-accent" />
        </div>
      </div>

      <div className="bg-cyber-panel border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="grid grid-cols-12 gap-4 px-8 py-6 bg-white/5 border-b border-white/10 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-5">Operative Identity</div>
          <div className="col-span-4 flex justify-between gap-1 px-2">
            {rows[0]?.level_scores?.map((ls, idx) => (
              <div key={idx} className="flex-1 text-center truncate" title={ls.level_name}>
                L{idx + 1}
              </div>
            ))}
          </div>
          <div className="col-span-2 text-right">Score (XP)</div>
        </div>

        <div className="divide-y divide-white/5">
          {rows.length > 0 ? rows.map((r, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-8 py-6 items-center group hover:bg-white/[0.02] transition-colors">
              <div className="col-span-1 flex justify-center">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border ${
                  i === 0 ? 'bg-cyber-accent text-black border-cyber-accent' :
                  i === 1 ? 'border-gray-400 text-gray-400' :
                  i === 2 ? 'border-orange-500/50 text-orange-500' :
                  'border-white/10 text-gray-500'
                }`}>
                  {i + 1}
                </span>
              </div>
              <div className="col-span-5">
                <div className="text-white font-mono group-hover:text-cyber-accent transition-colors truncate">{r.name || r.email}</div>
                <div className="text-[10px] text-gray-600 uppercase tracking-tighter mt-0.5">Verified Operative</div>
              </div>
              <div className="col-span-4 flex justify-between gap-1 px-2">
                {r.level_scores?.map((ls, idx) => (
                  <div key={idx} className="flex-1 text-center font-mono text-xs text-gray-400">
                    {ls.score}
                  </div>
                ))}
              </div>
              <div className="col-span-2 text-right">
                <div className="text-xl font-black text-white group-hover:text-cyber-accent transition-all">
                  {r.total_score.toLocaleString()}
                </div>
              </div>
            </div>
          )) : (
            <div className="p-20 text-center text-gray-600 italic uppercase tracking-widest text-sm">
              Waiting for data uplink...
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-30">
        {[
          { label: 'Sync Status', value: 'Live' },
          { label: 'Last Breach', value: '2m ago' },
          { label: 'Security', value: 'Active' },
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center p-4 border border-white/10 rounded-2xl">
            <span className="text-[8px] text-gray-500 uppercase tracking-widest">{s.label}</span>
            <span className="text-xs font-mono text-white mt-1">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
