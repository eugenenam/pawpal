export default function StepIndicator({ current, total }) {
  return (
    <span className="text-xs text-gray-400 font-medium">
      Step {current} of {total}
    </span>
  )
}
