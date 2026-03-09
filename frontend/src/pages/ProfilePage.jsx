import { useState, useEffect } from 'react'
import { api } from '../api/client'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/me')
      setUser(response.data)
      setName(response.data.name || '')
    } catch (error) {
      console.error('Error fetching profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile.' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const response = await api.put('/users/me', { 
        email: user.email,
        name: name 
      })
      setUser(response.data)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-cyber-accent animate-pulse font-mono tracking-widest uppercase">Initializing Profile...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="bg-black/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="bg-gradient-to-r from-cyber-accent/20 to-transparent p-8 border-b border-white/10">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
            User <span className="text-cyber-accent">Profile</span>
          </h1>
          <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mt-2 font-bold">Manage your operative identity</p>
        </div>

        <div className="p-8">
          {message.text && (
            <div className={`mb-6 p-4 rounded border ${
              message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
            } text-sm font-bold uppercase tracking-wider`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
              <input
                type="text"
                value={user?.email}
                disabled
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-400 font-mono cursor-not-allowed"
              />
              <p className="mt-1 text-[10px] text-gray-600 italic">Email cannot be changed for security reasons.</p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={user?.email}
                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-cyber-accent transition-colors"
              />
              <p className="mt-1 text-[10px] text-gray-500 italic">If empty, your email will be displayed on the leaderboard.</p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`w-full py-4 rounded-lg font-black uppercase tracking-widest transition-all ${
                saving 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-cyber-accent text-black hover:bg-white active:scale-[0.98]'
              }`}
            >
              {saving ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
