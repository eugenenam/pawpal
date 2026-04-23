export default function SlidingPanel({ open, onClose, children }) {
  return (
    <div
      className={`fixed top-14 right-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-10 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none"
        aria-label="Close panel"
      >
        ✕
      </button>
      {children}
    </div>
  )
}
