export default function SlidingPanel({ open, onClose, showClose = true, children }) {
  // Mobile: bottom sheet that slides up, leaving the map visible above
  // Desktop (sm+): right sidebar that slides in from the right
  const openClass = 'translate-y-0 sm:translate-x-0 sm:translate-y-0'
  const closedClass = 'translate-y-full sm:translate-x-full sm:translate-y-0'

  return (
    <div
      className={`fixed z-10 bg-white shadow-2xl overflow-y-auto transition-transform duration-300 ease-in-out
        bottom-0 left-0 right-0 max-h-[65vh] rounded-t-2xl
        sm:top-14 sm:left-auto sm:right-0 sm:bottom-0 sm:w-96 sm:max-h-none sm:rounded-none
        ${open ? openClass : closedClass}`}
    >
      {showClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Close panel"
        >
          ✕
        </button>
      )}
      {children}
    </div>
  )
}
