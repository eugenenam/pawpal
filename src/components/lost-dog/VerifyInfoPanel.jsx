import { useRef, useState } from 'react'

const RADIUS_OPTIONS = [0.5, 1, 2, 5]

const BREEDS = [
  'Australian Shepherd', 'Basenji', 'Basset Hound', 'Beagle', 'Bichon Frise',
  'Border Collie', 'Boston Terrier', 'Boxer', 'Bulldog', 'Cavalier King Charles Spaniel',
  'Chihuahua', 'Cocker Spaniel', 'Dachshund', 'Dalmatian', 'Doberman Pinscher',
  'French Bulldog', 'German Shepherd', 'Golden Retriever', 'Great Dane', 'Greyhound',
  'Labrador Retriever', 'Maltese', 'Miniature Schnauzer', 'Pit Bull Terrier', 'Pomeranian',
  'Poodle', 'Pug', 'Rottweiler', 'Shih Tzu', 'Siberian Husky',
  'Vizsla', 'Weimaraner', 'Yorkshire Terrier', 'Mixed',
]

const COLORS = [
  'Black', 'White', 'Brown', 'Golden/Yellow', 'Red/Rust',
  'Gray/Silver', 'Cream', 'Brindle', 'Merle', 'Tan/Fawn',
  'Black & White', 'Black & Tan', 'Tri-Color', 'Mixed',
]

// Determine the initial breed selection from dog.breed.
// If it exactly matches a BREEDS entry, use it; otherwise default to 'Beagle'.
function resolveInitialBreed(dogBreed) {
  if (dogBreed && BREEDS.includes(dogBreed)) return dogBreed
  return 'Beagle'
}

// Determine initial color selection via case-insensitive substring matching.
// Defaults to 'Tri-Color' if no match found (matches Daisy's "Tri-Color (Black/Brown/White)").
function resolveInitialColor(dogColor) {
  if (!dogColor) return 'Tri-Color'
  const lower = dogColor.toLowerCase()
  if (lower.includes('tri')) return 'Tri-Color'
  if (lower.includes('mixed')) return 'Mixed'
  const match = COLORS.find((c) => lower.includes(c.toLowerCase()))
  return match ?? 'Tri-Color'
}

export default function VerifyInfoPanel({ dog, alertRadius, onRadiusChange, onFormChange, onNext, onBack }) {
  const [dogName, setDogName] = useState(dog?.name ?? '')

  // Breed state: primary selection and optional secondary for "Mixed"
  const [breed1, setBreed1] = useState(() => resolveInitialBreed(dog?.breed))
  const [breed2, setBreed2] = useState('')

  const [color, setColor] = useState(() => resolveInitialColor(dog?.color))
  const [otherDetails, setOtherDetails] = useState('')

  // Photo uploader state: null | 'demo' | object URL string
  const [photoPreview, setPhotoPreview] = useState(null)
  const fileInputRef = useRef(null)

  // Breeds available for the secondary "Mixed" dropdown (excludes "Mixed" itself)
  const BREEDS_NO_MIXED = BREEDS.filter((b) => b !== 'Mixed')

  // Build the breed value to pass upstream
  function buildBreedValue() {
    if (breed1 === 'Mixed') {
      return breed2 ? `Mixed (${breed2})` : 'Mixed'
    }
    return breed1
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    // Revoke any previous object URL to avoid memory leaks
    if (photoPreview && photoPreview !== 'demo') {
      URL.revokeObjectURL(photoPreview)
    }
    setPhotoPreview(URL.createObjectURL(file))
  }

  function handleRemovePhoto() {
    if (photoPreview && photoPreview !== 'demo') {
      URL.revokeObjectURL(photoPreview)
    }
    setPhotoPreview(null)
    // Reset file input so the same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleNext() {
    onNext({ dogName, breed: buildBreedValue(), color, otherDetails, photoPreview })
  }

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white'

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
        {/* Dog Name */}
        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">Dog&apos;s Name</label>
          <input
            value={dogName}
            onChange={(e) => setDogName(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Photo Uploader */}
        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">
            Dog Photo <span className="text-gray-400">(optional)</span>
          </label>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex items-center gap-2">
            {/* Upload button — triggers hidden file input */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors"
            >
              Upload photo
            </button>

            {/* Demo photo shortcut */}
            <button
              type="button"
              onClick={() => setPhotoPreview('demo')}
              className="flex items-center justify-center border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500 hover:border-green-400 hover:text-green-600 bg-white transition-colors"
            >
              Use demo photo
            </button>
          </div>

          {/* Preview area */}
          {photoPreview && (
            <div className="flex items-center gap-2 mt-2">
              {photoPreview === 'demo' ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                    🐕
                  </div>
                  <span className="text-xs text-gray-400 mt-0.5">Demo</span>
                </div>
              ) : (
                <img
                  src={photoPreview}
                  alt="Dog preview"
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="text-xs text-red-400 hover:text-red-600"
              >
                ✕ Remove
              </button>
            </div>
          )}
        </div>

        {/* Breed and Color dropdowns */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Breed</label>
            <select
              value={breed1}
              onChange={(e) => {
                setBreed1(e.target.value)
                setBreed2('') // reset secondary when primary changes
              }}
              className={inputClass}
            >
              {BREEDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Color</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={inputClass}
            >
              {COLORS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary breed dropdown — only shown when "Mixed" is selected */}
        {breed1 === 'Mixed' && (
          <div>
            <label htmlFor="second-breed-select" className="text-xs text-gray-500 font-medium block mb-1">
              Second breed <span className="text-gray-400">(optional)</span>
            </label>
            <select
              id="second-breed-select"
              value={breed2}
              onChange={(e) => setBreed2(e.target.value)}
              className={inputClass}
            >
              <option value="">Select second breed</option>
              {BREEDS_NO_MIXED.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        )}

        {/* Alert Radius */}
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

        {/* Other details */}
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
