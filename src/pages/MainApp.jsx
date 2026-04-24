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
      </div>
    </div>
  )
}
