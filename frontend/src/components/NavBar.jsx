import { Link, useNavigate } from 'react-router-dom'
import { setToken, isAuthenticated } from '../api/client'

export default function NavBar() {
  const navigate = useNavigate()
  const logout = () => {
    setToken(null)
    navigate('/auth')
  }
  return (
    <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-2">
          <div className="w-8 h-8 bg-cyber-accent rounded flex items-center justify-center text-black font-black text-xl group-hover:rotate-90 transition-transform">E</div>
          <span className="text-white font-black tracking-tighter text-xl uppercase">Entity <span className="text-cyber-accent">Platform</span></span>
        </Link>
        <div className="flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-bold">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">Terminal</Link>
          <Link to="/map" className="text-gray-400 hover:text-white transition-colors">Mission Map</Link>
          <Link to="/leaderboard" className="text-gray-400 hover:text-white transition-colors">Leaderboard</Link>
          {isAuthenticated() && (
            <Link to="/profile" className="text-gray-400 hover:text-white transition-colors">Profile</Link>
          )}
          {!isAuthenticated() ? (
            <Link to="/auth" className="px-5 py-2 rounded-full border border-cyber-accent/50 text-cyber-accent hover:bg-cyber-accent hover:text-black transition-all">Secure Login</Link>
          ) : (
            <button onClick={logout} className="px-5 py-2 rounded-full border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all">Disconnect</button>
          )}
        </div>
      </div>
    </nav>
  )
}
