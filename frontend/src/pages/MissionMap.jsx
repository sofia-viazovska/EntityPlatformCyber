import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { MapPin, Lock, CheckCircle2, ChevronRight } from 'lucide-react'

const REQUIRED_PARTS = ['a', '2', '3', 'final']

function solvedPartCount(level) {
  const solved = new Set(
    level.submissions
      ?.filter((submission) => submission.is_correct)
      .map((submission) => submission.part) || []
  )
  return solved.size
}

function isLevelCompleted(level) {
  return solvedPartCount(level) >= REQUIRED_PARTS.length
}

export default function MissionMap() {
  const [levels, setLevels] = useState([])
  const [hoveredLevel, setHoveredLevel] = useState(null)

  useEffect(() => {
    api.get('/levels')
      .then(r => setLevels(r.data))
      .catch(err => {
        console.error('Failed to fetch levels:', err)
        // Fallback mock data if backend is not updated or unreachable
        setLevels([
          { id: 1, name: 'New York Airport, USA', x_percent: 26, y_percent: 32, unlocked: true, points: 100, order_index: 1 },
          { id: 2, name: 'Secure Military Base, Morocco', x_percent: 43, y_percent: 40, unlocked: false, points: 100, order_index: 2 },
          { id: 3, name: 'Home Sweet Home, China', x_percent: 75, y_percent: 40, unlocked: false, points: 100, order_index: 3 },
          { id: 4, name: 'Diplomatic Gala, France', x_percent: 45, y_percent: 30, unlocked: false, points: 100, order_index: 4 },
          { id: 5, name: 'Secret Laboratory, Australia', x_percent: 85, y_percent: 70, unlocked: false, points: 100, order_index: 5 },
          { id: 6, name: 'Final Destination, Antarctica', x_percent: 60, y_percent: 90, unlocked: false, points: 100, order_index: 6 },
        ])
      })
  }, [])

  const sortedLevels = [...levels].sort((a, b) => a.order_index - b.order_index)
  const completedCount = levels.filter(isLevelCompleted).length
  const nodeProgressPercent = levels.length > 0 ? (completedCount / levels.length) * 100 : 0
  const completedTaskCount = levels.reduce((sum, level) => sum + solvedPartCount(level), 0)
  const totalTaskCount = levels.length * REQUIRED_PARTS.length
  const taskProgressPercent = totalTaskCount > 0 ? (completedTaskCount / totalTaskCount) * 100 : 0

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Mission Control</h2>
          <p className="text-gray-500 text-[10px] tracking-[0.3em] uppercase mt-1">Global Operations Interface v4.2</p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyber-accent animate-pulse" />
            <span className="text-cyber-accent font-mono text-sm uppercase">Active Link</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 bg-black/40 rounded-3xl border border-white/10 overflow-hidden group shadow-2xl">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: "url('/assets/mission-map-bg.png')" }}
        />
        
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-20" />

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full z-15 pointer-events-none">
          {sortedLevels.map((level, index) => {
            if (index === sortedLevels.length - 1) return null
            const nextLevel = sortedLevels[index + 1]
            return (
              <line
                key={`line-${level.id}-${nextLevel.id}`}
                x1={`${level.x_percent}%`}
                y1={`${level.y_percent}%`}
                x2={`${nextLevel.x_percent}%`}
                y2={`${nextLevel.y_percent}%`}
                stroke="#ff3b3b"
                strokeWidth="2"
                strokeDasharray="6,4"
                className="opacity-40"
              />
            )
          })}
        </svg>

        {/* Level Markers */}
        <div className="absolute inset-0 z-20">
          {levels.map((level) => {
            const completed = isLevelCompleted(level)
            const markerColor = completed
              ? 'border-cyber-success text-cyber-success shadow-[0_0_15px_rgba(34,197,94,0.55)]'
              : level.unlocked
                ? 'border-cyber-danger text-cyber-danger shadow-[0_0_15px_rgba(255,59,59,0.5)]'
                : 'border-gray-600 text-gray-500'
            const labelColor = completed
              ? 'bg-cyber-success text-black'
              : level.unlocked
                ? 'bg-cyber-danger text-white'
                : 'bg-gray-800 text-gray-400'

            return (
              <div
                key={level.id}
                className="absolute"
                style={{ 
                  left: `${level.x_percent}%`, 
                  top: `${level.y_percent}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onMouseEnter={() => setHoveredLevel(level)}
                onMouseLeave={() => setHoveredLevel(null)}
              >
                <Link
                  to={level.unlocked ? `/level/${level.id}` : '#'}
                  className={`relative flex items-center justify-center transition-all duration-300 ${
                    level.unlocked 
                      ? 'cursor-pointer hover:scale-125' 
                      : 'cursor-not-allowed opacity-60 grayscale'
                  }`}
                >
                  {/* Ping Animation */}
                  {level.unlocked && (
                    <>
                      <span className={`absolute w-12 h-12 rounded-full animate-ping ${completed ? 'bg-cyber-success/30' : 'bg-cyber-danger/30'}`} />
                      <span className={`absolute w-8 h-8 rounded-full animate-pulse ${completed ? 'bg-cyber-success/40' : 'bg-cyber-danger/40'}`} />
                    </>
                  )}

                  {/* Marker Body */}
                  <div className={`
                    relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center
                    bg-black transition-colors ${markerColor}
                  `}>
                    {completed ? (
                      <CheckCircle2 size={20} fill="currentColor" fillOpacity={0.2} />
                    ) : level.unlocked ? (
                      <MapPin size={20} fill="currentColor" fillOpacity={0.2} />
                    ) : (
                      <Lock size={16} />
                    )}
                  </div>

                  {/* Level Tag (Label) */}
                  <div className={`
                    absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full
                    text-[10px] font-mono tracking-tighter uppercase transition-all duration-300
                    ${hoveredLevel?.id === level.id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
                    ${labelColor}
                  `}>
                    {completed ? `${level.name} - completed` : level.name}
                  </div>
                </Link>
              </div>
            )
          })}
        </div>

        {/* Floating Level Info Panel */}
        {hoveredLevel && (
          <div className="absolute bottom-8 left-8 z-30 w-72 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-mono text-cyber-danger uppercase tracking-widest">Node {String(hoveredLevel.order_index).padStart(2, '0')}</span>
                <h3 className="text-xl font-bold text-white leading-tight">{hoveredLevel.name}</h3>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-500 uppercase">Value</div>
                <div className="text-cyber-accent font-mono font-bold">{hoveredLevel.points} PTS</div>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 mb-6 line-clamp-2 leading-relaxed">
              {hoveredLevel.description || 'Intercept communications and breach the perimeter of this secure node.'}
            </p>

            {hoveredLevel.unlocked ? (
              <Link 
                to={`/level/${hoveredLevel.id}`}
                className={`flex items-center justify-center w-full gap-2 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors group/btn ${
                  isLevelCompleted(hoveredLevel)
                    ? 'bg-cyber-success hover:bg-green-400 text-black'
                    : 'bg-cyber-danger hover:bg-red-600 text-white'
                }`}
              >
                {isLevelCompleted(hoveredLevel) ? 'Review Completed Node' : 'Infiltrate Now'}
                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div className="flex items-center justify-center w-full gap-2 py-3 bg-white/5 text-gray-500 text-xs font-bold uppercase tracking-widest rounded-xl border border-white/5 cursor-not-allowed">
                <Lock size={14} />
                Access Encrypted
              </div>
            )}
          </div>
        )}

        {/* Global Stats Overlay */}
        <div className="absolute top-8 right-8 z-30 hidden lg:block">
          <div className="bg-cyan-950/30 backdrop-blur-sm border border-cyber-accent/25 rounded-2xl p-4 space-y-4 w-48 shadow-[0_0_24px_rgba(0,229,255,0.18)]">
            <div>
              <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Nodes Compromised</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-cyber-accent" style={{ width: `${nodeProgressPercent}%` }} />
                </div>
                <span className="text-xs font-mono text-white">
                  {String(completedCount).padStart(2, '0')}/{String(levels.length).padStart(2, '0')}
                </span>
              </div>
            </div>
            <div>
              <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Signal Strength</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-cyber-accent" style={{ width: `${taskProgressPercent}%` }} />
                </div>
                <span className="text-xs font-mono text-cyber-accent">{Math.round(taskProgressPercent)}%</span>
              </div>
              <div className="mt-1 text-[9px] text-gray-600 font-mono">
                {completedTaskCount}/{totalTaskCount} tasks
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
