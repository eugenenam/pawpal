const RADIUS_OPTIONS = [0.5, 1, 2, 5]

export default function DropPinPanel({ pin, onPinChange, alertRadius, onRadiusChange, onNext }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
        <p className="font-medium mb-1">📍 Drop a pin on the map</p>
        <p className="text-green-700 text-xs">
          Tap the map to mark your dog&apos;s last known location.
          You can reposition the pin before continuing.
        </p>
      </div>

      {pin ? (
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Last known location</p>
          <p className="text-sm font-medium text-gray-900">📍 {pin.address}</p>
          <button
            onClick={() => onPinChange(null)}
            className="text-xs text-green-600 hover:text-green-800 mt-1"
          >
            Clear pin
          </button>
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-400">
          No pin placed yet
        </div>
      )}

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

      <button
        onClick={onNext}
        disabled={!pin}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
      >
        Next →
      </button>
    </div>
  )
}
