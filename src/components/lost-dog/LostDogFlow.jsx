import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import SlidingPanel from '../panel/SlidingPanel'
import DropPinPanel from './DropPinPanel'
import VerifyInfoPanel from './VerifyInfoPanel'
import ReviewPanel from './ReviewPanel'
import ConfirmationPanel from './ConfirmationPanel'
import { createAlert, resolveAlert } from '../../services/alerts'

export default function LostDogFlow({
  open, onClose, mapPin, onPinChange, alertRadius, onRadiusChange, onShowRings,
}) {
  const { dog, profile, isDemoMode } = useAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({})
  const [savedAlert, setSavedAlert] = useState(null)

  async function handleClose() {
    if (savedAlert?.id) {
      await resolveAlert(savedAlert.id, isDemoMode)
    }
    setStep(1)
    setFormData({})
    setSavedAlert(null)
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
    setSavedAlert({ ...alertData, ...result })
    onShowRings()
    setStep(4)
  }

  const panelTitle = ['', 'Where was your dog last seen?', 'Verify dog info', 'Review alert', ''][step] || ''

  return (
    <SlidingPanel open={open} onClose={handleClose}>
      <div className="p-5 pt-10">
        {step < 4 && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">{panelTitle}</h2>
            {step > 1 && step < 4 && (
              <span className="text-xs text-gray-400">Step {step - 1} of 3</span>
            )}
          </div>
        )}

        {step === 1 && (
          <DropPinPanel
            pin={mapPin}
            onPinChange={onPinChange}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <VerifyInfoPanel
            dog={dog}
            alertRadius={alertRadius}
            onRadiusChange={onRadiusChange}
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
        {step === 4 && (
          <ConfirmationPanel
            alert={savedAlert}
            onResolve={handleClose}
          />
        )}
      </div>
    </SlidingPanel>
  )
}
