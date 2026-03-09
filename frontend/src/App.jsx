import { Routes, Route, Navigate, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import MissionMap from './pages/MissionMap'
import LevelPage from './pages/LevelPage'
import Leaderboard from './pages/Leaderboard'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/ProtectedRoute'
import NavBar from './components/NavBar'

export default function App() {
  return (
    <div className="min-h-screen bg-cyber-bg text-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MissionMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/level/:id"
            element={
              <ProtectedRoute>
                <LevelPage />
              </ProtectedRoute>
            }
          />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
