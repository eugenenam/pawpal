import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReviewPanel from './ReviewPanel'

const mockProps = {
  dog: { name: 'Daisy', breed: 'Beagle', age_years: 3, gender: 'female', color: 'Tri-Color', photo_url: null },
  profile: { full_name: 'Anxious Alice', phone: '(917) 123-4567' },
  mapPin: { lat: 40.68, lng: -73.98, address: 'Park Slope, Brooklyn' },
  alertRadius: 2,
  formData: { dogName: 'Daisy', breed: 'Beagle', color: 'Tri-Color', otherDetails: 'Red collar' },
  onNext: vi.fn(),
  onBack: vi.fn(),
}

describe('ReviewPanel', () => {
  it('renders the dog name in the alert preview', () => {
    render(<ReviewPanel {...mockProps} />)
    expect(screen.getByText(/Daisy/)).toBeInTheDocument()
  })

  it('renders the last seen address', () => {
    render(<ReviewPanel {...mockProps} />)
    expect(screen.queryAllByText(/Park Slope, Brooklyn/).length).toBeGreaterThan(0)
  })

  it('renders the alert radius', () => {
    render(<ReviewPanel {...mockProps} />)
    expect(screen.getByText(/2 miles/)).toBeInTheDocument()
  })

  it('calls onNext when Send is clicked', async () => {
    const onNext = vi.fn()
    const user = userEvent.setup()
    render(<ReviewPanel {...mockProps} onNext={onNext} />)
    await user.click(screen.getByRole('button', { name: /send/i }))
    expect(onNext).toHaveBeenCalled()
  })

  it('calls onBack when Back is clicked', async () => {
    const onBack = vi.fn()
    const user = userEvent.setup()
    render(<ReviewPanel {...mockProps} onBack={onBack} />)
    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalled()
  })
})
