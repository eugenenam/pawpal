export default function ConfirmationPanel({ alert, onResolve }) {
  const count = alert?.notified_count ?? 47
  const shelters = alert?.shelters_notified ?? 3
  const radius = alert?.alertRadius ?? 2

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
          ✅
        </div>
        <h2 className="text-lg font-bold text-green-800">Alert Sent!</h2>
        <p className="text-sm text-green-700 mt-1">
          {alert?.dogName}&apos;s alert is now live
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex -space-x-2">
            {['🧑', '👩', '👨'].map((emoji, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-green-200 border-2 border-white flex items-center justify-center text-sm">
                {emoji}
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-bold text-green-800">
              +{count} users notified
            </p>
            <p className="text-xs text-green-600">within {radius} miles</p>
          </div>
        </div>

        {/* Shelter list header */}
        <div className="flex items-center gap-2 text-sm text-green-700">
          <span>📧</span>
          <span><strong>{shelters} shelters notified</strong></span>
        </div>

        {/* Divider */}
        <div className="border-t border-green-200 my-2" />

        {/* Individual shelter rows */}
        <div className="flex flex-col gap-2">
          {[
            {
              name: 'Brooklyn Paws Rescue',
              address: '147 Bedford Ave, Brooklyn, NY 11211',
              phone: '(718) 555-0192',
              tel: '+17185550192',
            },
            {
              name: 'Prospect Heights Animal Care',
              address: '89 Vanderbilt Ave, Brooklyn, NY 11205',
              phone: '(718) 555-0347',
              tel: '+17185550347',
            },
            {
              name: 'Bay Ridge Pet Haven',
              address: '412 86th St, Brooklyn, NY 11209',
              phone: '(718) 555-0581',
              tel: '+17185550581',
            },
          ].map((shelter) => (
            <div key={shelter.name}>
              <p className="text-xs font-semibold text-green-800">{shelter.name}</p>
              <p className="text-xs text-green-600">{shelter.address}</p>
              <a
                href={`tel:${shelter.tel}`}
                className="text-xs text-green-600 underline"
              >
                {shelter.phone}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
        <strong>Tip:</strong> Keep an eye out in your neighborhood and check nearby shelters within the next 24-48 hours.
      </div>

      <button
        onClick={onResolve}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
      >
        Mark as Found ✓
      </button>
    </div>
  )
}
