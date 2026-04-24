import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VerifyInfoPanel from './VerifyInfoPanel'

const mockDog = {
  name: 'Daisy', breed: 'Beagle', color: 'Tri-Color', age_years: 3,
  gender: 'female', weight_lbs: 21, photo_url: null,
}

describe('VerifyInfoPanel', () => {
  it('pre-fills dog name from profile', () => {
    render(<VerifyInfoPanel dog={mockDog} alertRadius={2} onRadiusChange={vi.fn()} onFormChange={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByDisplayValue('Daisy')).toBeInTheDocument()
  })

  it('pre-fills breed from profile', () => {
    render(<VerifyInfoPanel dog={mockDog} alertRadius={2} onRadiusChange={vi.fn()} onFormChange={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByDisplayValue('Beagle')).toBeInTheDocument()
  })

  it('shows the current alert radius', () => {
    render(<VerifyInfoPanel dog={mockDog} alertRadius={2} onRadiusChange={vi.fn()} onFormChange={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText('2 miles selected')).toBeInTheDocument()
  })

  it('calls onNext with form data when Review is clicked', async () => {
    const onNext = vi.fn()
    const user = userEvent.setup()
    render(<VerifyInfoPanel dog={mockDog} alertRadius={2} onRadiusChange={vi.fn()} onFormChange={vi.fn()} onNext={onNext} onBack={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /review/i }))
    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({ dogName: 'Daisy' }))
  })
})
