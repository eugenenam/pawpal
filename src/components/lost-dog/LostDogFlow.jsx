import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import SlidingPanel from '../panel/SlidingPanel'
import DropPinPanel from './DropPinPanel'
import VerifyInfoPanel from './VerifyInfoPanel'
import ReviewPanel from './ReviewPanel'
import { createAlert } from '../../services/alerts'

export default function LostDogFlow({
  open, onClose, mapPin, onPinChange, alertRadius, onRadiusChange, onShowRings, onAlertCreated,
}) {
  const { dog, profile, isDemoMode } = useAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({})

  function handleClose() {
    setStep(1)
    setFormData({})
    onClose()
  }

  async function handleSend() {
    const alertData = {
      dogId: dog?.id,
      ownerId: profile?.id,
      dogName: dog?.name,
      lat: mapPin?.lat,
      lng: mapPin?.lng,
      address: mapPin?.address,
      radiusMiles: alertRadius,
      otherDetails: formData.otherDetails,
      isDemoMode,
    }
    const result = await createAlert(alertData)
    const savedAlert = { ...alertData, ...result }
    // Reset flow state before handing off — prevents stale data on next open
    setStep(1)
    setFormData({})
    // Hand the alert up to MainApp, which owns the confirmation panel
    onShowRings()
    onAlertCreated(savedAlert)
  }

  const panelTitle = ['', 'Where was your dog last seen?', 'Verify dog info', 'Review alert'][step] || ''

  return (
    <SlidingPanel open={open} onClose={handleClose}>
      <div className="p-5 pt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">{panelTitle}</h2>
          {step > 1 && (
            <span className="text-xs text-gray-400">Step {step - 1} of 2</span>
          )}
        </div>

        {step === 1 && (
          <DropPinPanel
            pin={mapPin}
            onPinChange={onPinChange}
            alertRadius={alertRadius}
            onRadiusChange={onRadiusChange}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <VerifyInfoPanel
            dog={dog}
            onFormChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
            onNext={(data) => { setFormData(prev => ({ ...prev, ...data })); setStep(3) }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <ReviewPanel
            dog={dog}
            profile={profile}
            mapPin={mapPin}
            alertRadius={alertRadius}
            formData={formData}
            onNext={handleSend}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </SlidingPanel>
  )
}
