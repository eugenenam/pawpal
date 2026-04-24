import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { signIn, enterDemoMode } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/app')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleDemoMode() {
    enterDemoMode()
    navigate('/app')
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🐾</div>
          <h1 className="text-2xl font-bold text-green-800">PawPal</h1>
          <p className="text-sm text-green-600 mt-1">Log into your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <button
            type="button"
            onClick={handleDemoMode}
            className="border-2 border-green-200 text-green-700 font-semibold py-3 rounded-lg text-sm hover:bg-green-50 transition-colors"
          >
            Try Demo (no account needed)
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-green-600 font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
