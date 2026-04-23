import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LostDogFlow from './LostDogFlow'

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    dog: { name: 'Daisy', breed: 'Beagle', age_years: 3, gender: 'female', color: 'Tri-Color', photo_url: null },
    profile: { full_name: 'Anxious Alice', phone: '(917) 123-4567' },
    isDemoMode: true,
  }),
}))

vi.mock('../panel/SlidingPanel', () => ({
  default: ({ open, children }) => open ? <div data-testid="panel">{children}</div> : null,
}))
vi.mock('./DropPinPanel', () => ({ default: ({ onNext }) => <button onClick={() => onNext()}>Next from Drop</button> }))
vi.mock('./VerifyInfoPanel', () => ({ default: ({ onNext }) => <button onClick={() => onNext({})}>Next from Verify</button> }))
vi.mock('./ReviewPanel', () => ({ default: ({ onNext }) => <button onClick={onNext}>Send Alert</button> }))
vi.mock('./ConfirmationPanel', () => ({ default: ({ alert }) => <div>Confirmed: {alert?.dogName}</div> }))
vi.mock('../../services/alerts', () => ({
  createAlert: vi.fn().mockResolvedValue({ id: 'alert-1', notified_count: 47, shelters_notified: 3 }),
  resolveAlert: vi.fn().mockResolvedValue({ id: 'alert-1' }),
}))

describe('LostDogFlow', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    mapPin: { lat: 40.68, lng: -73.98, address: 'Park Slope, Brooklyn' },
    onPinChange: vi.fn(),
    alertRadius: 2,
    onRadiusChange: vi.fn(),
    onShowRings: vi.fn(),
  }

  it('renders drop pin panel at step 1', () => {
    render(<LostDogFlow {...defaultProps} />)
    expect(screen.getByText('Next from Drop')).toBeInTheDocument()
  })

  it('advances to step 2 when drop pin Next is clicked', async () => {
    const user = userEvent.setup()
    render(<LostDogFlow {...defaultProps} />)
    await user.click(screen.getByText('Next from Drop'))
    expect(screen.getByText('Next from Verify')).toBeInTheDocument()
  })

  it('advances to step 3 when verify Next is clicked', async () => {
    const user = userEvent.setup()
    render(<LostDogFlow {...defaultProps} />)
    await user.click(screen.getByText('Next from Drop'))
    await user.click(screen.getByText('Next from Verify'))
    expect(screen.getByText('Send Alert')).toBeInTheDocument()
  })
})
