import { useState } from 'react'

const RADIUS_OPTIONS = [0.5, 1, 2, 5]

export default function VerifyInfoPanel({ dog, alertRadius, onRadiusChange, onFormChange, onNext, onBack }) {
  const [dogName, setDogName] = useState(dog?.name ?? '')
  const [breed, setBreed] = useState(dog?.breed ?? '')
  const [color, setColor] = useState(dog?.color ?? '')
  const [otherDetails, setOtherDetails] = useState('')

  function handleNext() {
    onNext({ dogName, breed, color, otherDetails })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3">
        <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center text-lg flex-shrink-0">
          🐕
        </div>
        <div>
          <p className="text-xs text-gray-500">Verify your dog&apos;s info</p>
          <p className="text-xs text-green-700">Pre-filled from your profile. Edit if needed.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">Dog&apos;s Name</label>
          <input
            value={dogName}
            onChange={(e) => setDogName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Breed</label>
            <input
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Color</label>
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">Alert Radius</label>
          <div className="flex gap-2">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => onRadiusChange(r)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  alertRadius === r
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
                }`}
              >
                {r} mi
              </button>
            ))}
          </div>
          <p className="text-xs text-green-700 mt-1">{alertRadius} miles selected</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">
            Other details <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            value={otherDetails}
            onChange={(e) => setOtherDetails(e.target.value)}
            placeholder="Identifying marks, collar color, last seen near a park..."
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          Review →
        </button>
      </div>
    </div>
  )
}
