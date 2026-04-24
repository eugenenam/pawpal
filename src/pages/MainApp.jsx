import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import TopNav from '../components/layout/TopNav'
import MapView from '../components/map/MapView'
import LostDogFlow from '../components/lost-dog/LostDogFlow'

export default function MainApp() {
  const { loading } = useAuth()
  const [activePanel, setActivePanel] = useState(null)
  const [mapPin, setMapPin] = useState(null)
  const [alertRadius, setAlertRadius] = useState(2)
  const [showRings, setShowRings] = useState(false)

  const handlePinChange = useCallback((pin) => setMapPin(pin), [])
  const handleRadiusChange = useCallback((r) => setAlertRadius(r), [])

  function handleLostDogClick() {
    setShowRings(false)
    setActivePanel('lostDog')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-green-50">
      <div className="text-green-700 font-medium">Loading...</div>
    </div>
  )

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopNav onLostDogClick={handleLostDogClick} />
      <div className="flex-1 relative">
        <MapView
          pin={mapPin}
          onPinChange={handlePinChange}
          alertRadius={alertRadius}
          isPinMode={activePanel === 'lostDog'}
          showRings={showRings}
        />
        <LostDogFlow
          open={activePanel === 'lostDog'}
          onClose={() => { setActivePanel(null); setMapPin(null) }}
          mapPin={mapPin}
          onPinChange={handlePinChange}
          alertRadius={alertRadius}
          onRadiusChange={handleRadiusChange}
          onShowRings={() => setShowRings(true)}
        />
        {activePanel !== 'lostDog' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={handleLostDogClick}
              className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 text-sm transition-all active:scale-95"
            >
              <span className="text-lg">🐾</span>
              Report Lost Dog
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
