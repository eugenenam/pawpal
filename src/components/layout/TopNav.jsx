import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function TopNav({ onLostDogClick }) {
  const { user, profile, isDemoMode, enterDemoMode, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  function handleDemoMode() {
    enterDemoMode()
    navigate('/app')
  }

  return (
    <nav className="h-14 bg-green-600 flex items-center justify-between px-4 shadow-md z-20 relative">
      <div className="flex items-center gap-2">
        <span className="text-white font-bold text-lg tracking-tight">🐾 PawPal</span>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-green-200 hover:text-white text-sm transition-colors">
          Profile
        </button>
        <button
          onClick={onLostDogClick}
          className="text-white font-semibold text-sm border-b-2 border-white pb-0.5"
        >
          Lost Dog
        </button>
        <button className="text-green-200 hover:text-white text-sm transition-colors">
          Places
        </button>
      </div>

      <div className="flex items-center gap-3">
        {isDemoMode && (
          <span className="text-xs text-green-200">
            Demo: {profile?.full_name}
          </span>
        )}
        {!user ? (
          <>
            <button
              onClick={handleDemoMode}
              className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white transition-colors"
            >
              Try Demo
            </button>
            <button
              onClick={() => navigate('/login')}
              className="text-green-100 hover:text-white text-sm transition-colors"
            >
              Log In
            </button>
          </>
        ) : (
          <button
            onClick={handleSignOut}
            className="text-green-100 hover:text-white text-sm transition-colors"
          >
            Sign Out
          </button>
        )}
      </div>
    </nav>
  )
}
