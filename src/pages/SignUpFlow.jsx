import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignUpFlow() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ownerData, setOwnerData] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' })
  const [dogData, setDogData] = useState({ name: '', breed: '', gender: 'female', ageYears: '' })

  function handleOwnerNext(e) {
    e.preventDefault()
    if (!ownerData.firstName || !ownerData.email || !ownerData.password) return
    setStep(2)
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp({
        email: ownerData.email,
        password: ownerData.password,
        fullName: `${ownerData.firstName} ${ownerData.lastName}`.trim(),
        phone: ownerData.phone,
        dogName: dogData.name,
        dogBreed: dogData.breed,
        dogGender: dogData.gender,
        dogAgeYears: parseInt(dogData.ageYears, 10) || 1,
      })
      navigate('/app')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🐾</div>
          <h1 className="text-2xl font-bold text-green-800">PawPal</h1>
          <p className="text-sm text-green-600 mt-1">
            {step === 1 ? 'Your Information' : "Your Dog's Information"}
          </p>
          <div className="flex justify-center gap-2 mt-3">
            {[1, 2].map((s) => (
              <div key={s} className={`w-2 h-2 rounded-full transition-colors ${s <= step ? 'bg-green-600' : 'bg-green-200'}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleOwnerNext} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="First Name"
                  value={ownerData.firstName}
                  onChange={(e) => setOwnerData(p => ({ ...p, firstName: e.target.value }))}
                  required
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  placeholder="Last Name"
                  value={ownerData.lastName}
                  onChange={(e) => setOwnerData(p => ({ ...p, lastName: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={ownerData.email}
                onChange={(e) => setOwnerData(p => ({ ...p, email: e.target.value }))}
                required
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={ownerData.password}
                onChange={(e) => setOwnerData(p => ({ ...p, password: e.target.value }))}
                required
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="tel"
                placeholder="Phone Number (optional)"
                value={ownerData.phone}
                onChange={(e) => setOwnerData(p => ({ ...p, phone: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button type="submit" className="bg-green-600 text-white font-semibold py-3 rounded-lg text-sm mt-1 hover:bg-green-700 transition-colors">
                Next →
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSignUp} className="flex flex-col gap-3">
              <input
                placeholder="Dog's Name"
                value={dogData.name}
                onChange={(e) => setDogData(p => ({ ...p, name: e.target.value }))}
                required
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                placeholder="Breed"
                value={dogData.breed}
                onChange={(e) => setDogData(p => ({ ...p, breed: e.target.value }))}
                required
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Age (years)"
                  type="number"
                  min="0"
                  value={dogData.ageYears}
                  onChange={(e) => setDogData(p => ({ ...p, ageYears: e.target.value }))}
                  required
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <select
                  value={dogData.gender}
                  onChange={(e) => setDogData(p => ({ ...p, gender: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-medium hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  )
}
