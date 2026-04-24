export default function ReviewPanel({ dog, profile, mapPin, alertRadius, formData, onNext, onBack }) {
  const name = formData.dogName ?? dog?.name ?? 'your dog'
  const breed = formData.breed ?? dog?.breed ?? 'unknown breed'
  const age = dog?.age_years ?? '?'
  const gender = dog?.gender ?? ''
  const address = mapPin?.address ?? 'unknown location'
  const description = `My dog ${name} is missing! ${gender === 'female' ? 'She' : 'He'} is a ${age}-year-old ${gender} ${breed}${formData.color ? ` with a ${formData.color} coat` : ''}, last seen near ${address}.`

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm font-bold text-red-800 mb-3">🚨 Lost Dog!</p>

        {formData.photoPreview && formData.photoPreview !== 'demo' ? (
          // User uploaded a real photo — show it
          <img src={formData.photoPreview} alt={name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3" />
        ) : formData.photoPreview === 'demo' || dog?.photo_url ? (
          // Demo placeholder or a photo_url from the dog profile
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 text-3xl">
            🐕
          </div>
        ) : (
          // No photo at all
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 text-3xl">
            🐕
          </div>
        )}

        <p className="text-sm text-gray-700 text-center leading-relaxed mb-3">{description}</p>

        {formData.otherDetails && (
          <p className="text-xs text-gray-500 text-center mb-2">
            Other details: {formData.otherDetails}
          </p>
        )}

        <p className="text-xs text-gray-500 text-center">
          If found, please contact <strong>{profile?.full_name}</strong> at{' '}
          <strong>{profile?.phone ?? 'contact via app'}</strong>
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
        Alerting users within <strong>{alertRadius} miles</strong> of {address}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          Send Alert 🚀
        </button>
      </div>
    </div>
  )
}
