import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

function Countdown({ start, end, active }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  if (!active) return <div className="text-red-400">MISSION TERMINATED</div>
  const endDate = end ? new Date(end) : null
  const diff = endDate ? Math.max(0, endDate - now) : 0
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="text-4xl font-mono text-cyber-accent">{h.toString().padStart(2,'0')}</span>
        <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Hours</span>
      </div>
      <span className="text-4xl font-mono text-cyber-accent">:</span>
      <div className="flex flex-col items-center">
        <span className="text-4xl font-mono text-cyber-accent">{m.toString().padStart(2,'0')}</span>
        <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Minutes</span>
      </div>
      <span className="text-4xl font-mono text-cyber-accent">:</span>
      <div className="flex flex-col items-center">
        <span className="text-4xl font-mono text-cyber-accent">{s.toString().padStart(2,'0')}</span>
        <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Seconds</span>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [state, setState] = useState({ is_active: false, start_time: null, end_time: null })
  useEffect(() => {
    api.get('/game-state').then(r => setState(r.data)).catch(()=>{})
  }, [])

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyber-accent/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-accent2/10 rounded-full blur-[100px] -z-10" />
      
      <div className="max-w-4xl w-full text-center space-y-12 px-6">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-block px-3 py-1 border border-cyber-accent/30 rounded-full text-[10px] tracking-[0.2em] text-cyber-accent bg-cyber-accent/5 mb-4">
            SYSTEM STATUS: OPERATIONAL
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
            <span className="text-white">ENTITY</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-accent to-cyber-accent2">PLATFORM</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-400 font-light leading-relaxed">
            Welcome, operative. Your mission is to breach the security of each node in the network. 
            Submit the correct FLAG for each level to advance. Score points and rise to the top of the leaderboard.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="p-8 border border-white/5 bg-white/5 backdrop-blur-sm rounded-2xl shadow-neon transition-all duration-500 hover:border-cyber-accent/20">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-6">Mission Countdown</div>
            <Countdown start={state.start_time} end={state.end_time} active={state.is_active} />
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
            <Link to="/map" className="px-12 py-5 bg-cyber-accent text-black font-bold text-lg rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] text-center">
              ACCESS MISSION MAP
            </Link>
            <Link to="/leaderboard" className="px-12 py-5 border border-white/10 bg-white/5 text-white font-bold text-lg rounded-xl hover:bg-white/10 transition-all text-center">
              VIEW LEADERBOARD
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 opacity-50">
          {[
            { label: 'NETWORK NODES', value: 'ACTIVE' },
            { label: 'ENCRYPTION', value: 'AES-256' },
            { label: 'SEC-LEVEL', value: 'RESTRICTED' },
            { label: 'CONNECTION', value: 'ENCRYPTED' },
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="text-[10px] text-gray-500 tracking-widest">{stat.label}</div>
              <div className="text-xs font-mono text-cyber-accent">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
