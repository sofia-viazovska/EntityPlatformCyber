import { useEffect, useState } from 'react'
import { api } from '../api/client'

const PAGE_SIZE = 10

export default function Leaderboard() {
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get('/leaderboard', { params: { page, page_size: PAGE_SIZE } })
      .then(r => {
        setRows(r.data.entries || [])
        setPage(r.data.page || 1)
        setTotal(r.data.total || 0)
        setTotalPages(r.data.total_pages || 1)
      })
      .catch(() => {
        setRows([])
        setTotal(0)
        setTotalPages(1)
      })
      .finally(() => setLoading(false))
  }, [page])

  const firstRank = (page - 1) * PAGE_SIZE + 1
  const lastRank = rows.length > 0 ? firstRank + rows.length - 1 : 0

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
          {rows.length > 0 ? rows.map((r, i) => {
            const rank = firstRank + i
            return (
            <div key={i} className="grid grid-cols-12 gap-4 px-8 py-6 items-center group hover:bg-white/[0.02] transition-colors">
              <div className="col-span-1 flex justify-center">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border ${
                  rank === 1 ? 'bg-cyber-accent text-black border-cyber-accent' :
                  rank === 2 ? 'border-gray-400 text-gray-400' :
                  rank === 3 ? 'border-orange-500/50 text-orange-500' :
                  'border-white/10 text-gray-500'
                }`}>
                  {rank}
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
          )}) : (
            <div className="p-20 text-center text-gray-600 italic uppercase tracking-widest text-sm">
              {loading ? 'Waiting for data uplink...' : 'No operatives found.'}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 px-8 py-5 bg-white/[0.03] border-t border-white/10">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
            {total > 0 ? `Showing ${firstRank}-${lastRank} of ${total}` : 'No results'}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-4 py-2 border border-white/10 rounded-lg text-[10px] text-white uppercase tracking-widest font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:border-cyber-accent hover:text-cyber-accent transition-colors"
            >
              Prev
            </button>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-4 py-2 border border-white/10 rounded-lg text-[10px] text-white uppercase tracking-widest font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:border-cyber-accent hover:text-cyber-accent transition-colors"
            >
              Next
            </button>
          </div>
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
