import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import TopNav from '../components/layout/TopNav'
import MapView from '../components/map/MapView'
import LostDogFlow from '../components/lost-dog/LostDogFlow'
import SlidingPanel from '../components/panel/SlidingPanel'
import ConfirmationPanel from '../components/lost-dog/ConfirmationPanel'
import { resolveAlert } from '../services/alerts'

export default function MainApp() {
  const { loading, isDemoMode } = useAuth()
  const [activePanel, setActivePanel] = useState(null)
  const [mapPin, setMapPin] = useState(null)
  const [alertRadius, setAlertRadius] = useState(2)
  const [showRings, setShowRings] = useState(false)
  const [sentAlert, setSentAlert] = useState(null)

  const handlePinChange = useCallback((pin) => setMapPin(pin), [])
  const handleRadiusChange = useCallback((r) => setAlertRadius(r), [])

  function handleLostDogClick() {
    setShowRings(false)
    setActivePanel('lostDog')
  }

  // Called by LostDogFlow after the alert is saved — closes the flow and
  // opens the persistent confirmation panel owned by MainApp
  function handleAlertCreated(alert) {
    setActivePanel(null)
    setSentAlert(alert)
  }

  async function handleResolveAlert() {
    if (sentAlert?.id) {
      await resolveAlert(sentAlert.id, isDemoMode)
    }
    setSentAlert(null)
    setMapPin(null)
    setShowRings(false)
  }

  function handleDismissConfirmation() {
    setSentAlert(null)
    setMapPin(null)
    setShowRings(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-green-50">
      <div className="text-green-700 font-medium">Loading...</div>
    </div>
  )

  const showFloatingButton = activePanel !== 'lostDog' && !sentAlert

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
          onAlertCreated={handleAlertCreated}
        />

        {/* Persistent confirmation panel — lives outside LostDogFlow so it
            cannot be accidentally dismissed by the flow's own state changes */}
        <SlidingPanel open={!!sentAlert} onClose={handleDismissConfirmation} showClose={false}>
          <div className="p-5 pt-10">
            <ConfirmationPanel
              alert={sentAlert}
              onResolve={handleResolveAlert}
              onDismiss={handleDismissConfirmation}
            />
          </div>
        </SlidingPanel>

        {showFloatingButton && (
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
