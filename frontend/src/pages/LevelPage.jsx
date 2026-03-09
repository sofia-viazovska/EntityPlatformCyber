import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'

export default function LevelPage() {
  const { id } = useParams()
  const [level, setLevel] = useState(null)
  // Four independent inputs: 3 sub answers + 1 final
  const [answers, setAnswers] = useState({ a: '', 2: '', 3: '', final: '' })
  const [results, setResults] = useState({ a: null, 2: null, 3: null, final: null })
  const [errors, setErrors] = useState({ a: '', 2: '', 3: '', final: '' })
  const [attemptsLeft, setAttemptsLeft] = useState({ a: 5, 2: 5, 3: 5, final: 5 })
  const [score, setScore] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const [showMathModal, setShowMathModal] = useState(false)
  const [mathProblem, setMathProblem] = useState({ question: '', answer: 0 })
  const [mathInput, setMathInput] = useState('')
  const [mathError, setMathError] = useState(false)

  const generateMathProblem = () => {
    const a = Math.floor(Math.random() * 900000) + 100000
    const b = Math.floor(Math.random() * 9000) + 1000
    setMathProblem({ question: `${a} + ${b}`, answer: a + b })
    setMathInput('')
    setMathError(false)
    setShowMathModal(true)
  }

  const fetchLevel = () => {
    setIsRefreshing(true);
    api.get(`/levels/${id}`)
      .then(r => {
        console.log('Level fetched:', r.data);
        const data = r.data
        setLevel(data);
        
        // Restore progress from submissions
        if (data.submissions) {
          const newAnswers = { a: '', 2: '', 3: '', final: '' }
          const newResults = { a: null, 2: null, 3: null, final: null }
          const currentMax = 5
          const newAttempts = { a: currentMax, 2: currentMax, 3: currentMax, final: currentMax }
          let newScore = 0

          data.submissions.forEach(s => {
            // Keep the last answer in the field
            newAnswers[s.part] = s.answer
            
            // If correct, show success result and add to score
            if (s.is_correct) {
              if (!newResults[s.part] || !newResults[s.part].is_correct) {
                newScore += 20
              }
              newResults[s.part] = { is_correct: true, message: 'Already solved' }
            } else {
              // Only set to incorrect if we haven't found a correct one yet
              if (!newResults[s.part]) {
                newResults[s.part] = { is_correct: false, message: 'Incorrect.' }
              }
            }
            
            // Track attempts left
            newAttempts[s.part] = Math.max(0, currentMax - s.attempts)
          })

          setAnswers(newAnswers)
          setResults(newResults)
          setAttemptsLeft(newAttempts)
          setScore(newScore)
        }
      })
      .catch((err) => {
        console.error('Failed to fetch level:', err);
        // Fallback or error state
        if (err.response?.status === 401) {
          setErrors(prev => ({ ...prev, global: 'Unauthorized. Please login again.' }));
        } else {
          setErrors(prev => ({ ...prev, global: 'Failed to connect to Mission Control.' }));
        }
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  }

  useEffect(() => {
    fetchLevel();
  }, [id])

  const increaseAttempts = async (e) => {
    if (e) e.preventDefault();
    if (parseInt(mathInput) === mathProblem.answer) {
      try {
        await api.post(`/levels/${id}/increase-attempts`);
        setShowMathModal(false);
        fetchLevel();
      } catch (e) {
        alert(e.response?.data?.detail || 'Failed to increase attempts');
      }
    } else {
      setMathError(true);
    }
  }

  const submitFor = (key) => async (e) => {
    e.preventDefault()
    if (attemptsLeft[key] <= 0) return
    // reset state
    setErrors(prev => ({ ...prev, [key]: '' }))
    setResults(prev => ({ ...prev, [key]: null }))
    try {
      const r = await api.post('/submit', { level_id: Number(id), part: String(key), answer: answers[key] })
      setResults(prev => ({ ...prev, [key]: r.data }))
      if (r.data.is_correct && r.data.message === 'Correct!') {
        // Do not clear the answer anymore as requested
        setScore(prev => prev + 20)
      }
    } catch (e) {
      setErrors(prev => ({ ...prev, [key]: e.response?.data?.detail || 'Submission failed' }))
    } finally {
      setAttemptsLeft(prev => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }))
    }
  }

  if (!level) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="text-cyber-accent animate-pulse font-mono tracking-[0.5em]">INITIALIZING...</div>
      {errors.global && (
        <div className="text-red-500 font-mono text-xs uppercase animate-in fade-in duration-500">
          [!] Error: {errors.global}
        </div>
      )}
      {errors.global && (
        <Link to="/auth" className="text-xs text-gray-500 hover:text-white underline font-mono uppercase">
          Return to Login
        </Link>
      )}
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      <div className="flex items-center gap-4">
        <Link to="/map" className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <div>
          <div className="text-[10px] text-cyber-accent uppercase tracking-[0.3em]">Node Connection Established</div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Level {level.order_index}: {level.name}</h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            
            <div className="relative space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyber-accent animate-ping" />
                <span className="text-xs font-mono text-cyber-accent uppercase tracking-widest">Encrypted Data Stream</span>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed font-light whitespace-pre-wrap">
                {level.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Security', value: 'Level ' + (level.order_index * 2) },
              { label: 'Complexity', value: 'High' },
              { label: 'Reward', value: level.points + ' PTS' },
              { label: 'Status', value: level.unlocked ? 'Unlocked' : 'Locked' },
            ].map((s, i) => (
              <div key={i} className="bg-black/40 border border-white/5 p-4 rounded-2xl text-center">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{s.label}</div>
                <div className="text-sm font-bold text-white uppercase">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-cyber-panel border border-cyber-accent/30 p-8 rounded-3xl shadow-neon relative">
            <div className="absolute -top-3 left-8 px-3 py-1 bg-cyber-accent text-black text-[10px] font-black uppercase tracking-[0.2em] rounded">
              Injection Terminal
            </div>

            <div className="space-y-8">
              {[
                { key: 'a', label: 'Sublevel A' },
                { key: '2', label: 'Sublevel 2' },
                { key: '3', label: 'Sublevel 3' },
                { key: 'final', label: 'Final Answer' },
              ].map(({ key, label }) => {
                const disabled = !level.unlocked || attemptsLeft[key] <= 0
                const res = results[key]
                const err = errors[key]
                return (
                  <form key={key} onSubmit={submitFor(key)} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</label>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Attempts left: <span className={attemptsLeft[key] === 0 ? 'text-red-400' : 'text-cyber-accent'}>{attemptsLeft[key]}</span>/5</div>
                    </div>
                    <input 
                      className="w-full bg-black/80 border border-white/10 rounded-xl px-4 py-4 text-cyber-accent focus:border-cyber-accent focus:outline-none transition-all font-mono placeholder:text-white/10"
                      placeholder={key === 'final' ? 'ENTITY{...}' : `part-${key.toUpperCase()} ...`} 
                      value={answers[key]}
                      onChange={(e)=>setAnswers(prev=>({ ...prev, [key]: e.target.value }))}
                      disabled={disabled}
                      required
                    />
                    <button 
                      className={`w-full py-3 rounded-xl font-black uppercase tracking-widest transition-all ${
                        !disabled 
                        ? 'bg-cyber-accent text-black hover:scale-[1.02] shadow-[0_0_15px_rgba(0,229,255,0.3)]' 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                      type="submit"
                      disabled={disabled}
                    >
                      Submit {label}
                    </button>

                    {res && (
                      <div className={`p-3 rounded-xl text-center text-xs font-mono border animate-in zoom-in-95 duration-300 ${
                        res.is_correct 
                        ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                        : 'bg-red-500/10 border-red-500/50 text-red-400'
                      }`}>
                        [{res.is_correct ? 'SUCCESS' : 'FAILED'}]: {res.message}
                      </div>
                    )}
                    {err && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-xs text-center font-mono">
                        [SYSTEM_ERR]: {err}
                      </div>
                    )}
                  </form>
                )
              })}
            </div>
          </div>

          <div className="p-6 border border-white/5 bg-white/5 rounded-3xl space-y-4">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Score</div>
            <div className="flex items-center gap-4">
               <div className="text-4xl font-black text-cyber-accent font-mono">{score}</div>
               <div className="text-[10px] text-gray-500 uppercase tracking-widest leading-none">Points<br/>Accumulated</div>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-cyber-accent transition-all duration-500" 
                 style={{ width: `${(score / 80) * 100}%` }}
               />
            </div>
          </div>

          {score < 80 && Object.entries(attemptsLeft).some(([key, attempts]) => attempts === 0 && !results[key]?.is_correct) && (
            <button 
              onClick={generateMathProblem}
              className="w-full py-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-2xl font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            >
              Increase attempts limit
            </button>
          )}
        </div>
      </div>

      {showMathModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-cyber-panel border border-cyber-accent/30 p-8 rounded-3xl shadow-neon max-w-md w-full relative">
            <button 
              onClick={() => setShowMathModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <div className="text-center space-y-6">
              <div className="text-xs font-mono text-cyber-accent uppercase tracking-[0.2em]">Verification Required</div>
              <h3 className="text-xl font-black text-white uppercase">Solve to gain 2 more attempts</h3>
              
              <div className="bg-black/50 border border-white/10 p-6 rounded-2xl">
                <div className="text-2xl font-mono text-white mb-2">{mathProblem.question} = ?</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Simple math challenge</div>
              </div>

              <form onSubmit={increaseAttempts} className="space-y-4">
                <input 
                  autoFocus
                  className={`w-full bg-black/80 border ${mathError ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-4 text-cyber-accent focus:border-cyber-accent focus:outline-none transition-all font-mono text-center text-xl`}
                  placeholder="Your answer"
                  value={mathInput}
                  onChange={(e) => {
                    setMathInput(e.target.value);
                    setMathError(false);
                  }}
                  required
                />
                {mathError && (
                  <div className="text-red-500 text-[10px] font-mono uppercase tracking-widest animate-shake">
                    [!] Verification failed. Try again.
                  </div>
                )}
                <button 
                  type="submit"
                  className="w-full py-4 bg-cyber-accent text-black rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                >
                  Verify & Add 2 Attempts
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
