import { useState } from 'react'
import { api, setToken } from '../api/client'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      let r;
      if (mode === 'register') {
        r = await api.post('/register', { email, password })
      } else {
        const params = new URLSearchParams()
        params.append('username', email)
        params.append('password', password)
        r = await api.post('/login', params)
      }
      setToken(r.data.access_token)
      window.location.href = '/map'
    } catch (e) {
      console.error('Auth error details:', e.response?.data);
      if (Array.isArray(e.response?.data?.detail)) {
        setError(e.response.data.detail[0].msg || 'Validation error');
      } else {
        setError(e.response?.data?.detail || 'Authentication failed');
      }
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyber-accent/10 rounded-full blur-2xl -z-10" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyber-accent2/10 rounded-full blur-2xl -z-10" />
        
        <div className="bg-cyber-panel border border-white/10 p-8 rounded-2xl shadow-2xl space-y-8 backdrop-blur-md">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black tracking-tighter text-white">
              {mode === 'login' ? 'IDENTITY VERIFICATION' : 'AGENT REGISTRATION'}
            </h2>
            <p className="text-xs text-gray-500 uppercase tracking-[0.3em]">
              Secure Access Protocol
            </p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-xs rounded-lg animate-pulse">
                [ERROR]: {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest ml-1">Terminal Email</label>
                <input 
                  className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-cyber-accent focus:border-cyber-accent/50 focus:outline-none transition-all font-mono"
                  type="email" 
                  value={email} 
                  onChange={(e)=>setEmail(e.target.value)} 
                  placeholder="agent@entity.net"
                  required 
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest ml-1">Access Key</label>
                <input 
                  className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-cyber-accent focus:border-cyber-accent/50 focus:outline-none transition-all font-mono"
                  type="password" 
                  value={password} 
                  onChange={(e)=>setPassword(e.target.value)} 
                  placeholder="********"
                  required 
                />
              </div>
            </div>

            <button className="group relative w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-cyber-accent transition-all duration-300 overflow-hidden" type="submit">
              <span className="relative z-10">{mode === 'login' ? 'Initialize Login' : 'Register Identity'}</span>
              <div className="absolute inset-0 bg-cyber-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </form>

          <div className="text-center pt-4">
            <button 
              type="button" 
              className="text-[10px] text-gray-500 uppercase tracking-[0.2em] hover:text-cyber-accent transition-colors" 
              onClick={()=>setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? "Don't have access? Create Identity" : "Already registered? Verify Identity"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
