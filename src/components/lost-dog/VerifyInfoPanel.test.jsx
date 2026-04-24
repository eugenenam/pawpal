import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VerifyInfoPanel from './VerifyInfoPanel'

const mockDog = {
  name: 'Daisy', breed: 'Beagle', color: 'Tri-Color', age_years: 3,
  gender: 'female', weight_lbs: 21, photo_url: null,
}

const defaultProps = {
  dog: mockDog,
  alertRadius: 2,
  onRadiusChange: vi.fn(),
  onFormChange: vi.fn(),
  onNext: vi.fn(),
  onBack: vi.fn(),
}

describe('VerifyInfoPanel', () => {
  it('pre-fills dog name from profile', () => {
    render(<VerifyInfoPanel {...defaultProps} />)
    expect(screen.getByDisplayValue('Daisy')).toBeInTheDocument()
  })

  it('pre-fills breed dropdown from profile', () => {
    render(<VerifyInfoPanel {...defaultProps} />)
    // getByDisplayValue works on <select> elements too
    expect(screen.getByDisplayValue('Beagle')).toBeInTheDocument()
  })

  it('pre-selects Tri-Color in the color dropdown', () => {
    render(<VerifyInfoPanel {...defaultProps} />)
    expect(screen.getByDisplayValue('Tri-Color')).toBeInTheDocument()
  })

  it('defaults breed to Beagle when dog.breed does not match any BREEDS entry', () => {
    const dog = { ...mockDog, breed: 'Unknown Mutt' }
    render(<VerifyInfoPanel {...defaultProps} dog={dog} />)
    expect(screen.getByDisplayValue('Beagle')).toBeInTheDocument()
  })

  it('shows the current alert radius', () => {
    render(<VerifyInfoPanel {...defaultProps} />)
    expect(screen.getByText('2 miles selected')).toBeInTheDocument()
  })

  it('calls onNext with form data when Review is clicked', async () => {
    const onNext = vi.fn()
    const user = userEvent.setup()
    render(<VerifyInfoPanel {...defaultProps} onNext={onNext} />)
    await user.click(screen.getByRole('button', { name: /review/i }))
    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({ dogName: 'Daisy' }))
  })

  it('passes breed value in onNext', async () => {
    const onNext = vi.fn()
    const user = userEvent.setup()
    render(<VerifyInfoPanel {...defaultProps} onNext={onNext} />)
    await user.click(screen.getByRole('button', { name: /review/i }))
    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({ breed: 'Beagle' }))
  })

  it('shows second breed dropdown when Mixed is selected', async () => {
    const user = userEvent.setup()
    render(<VerifyInfoPanel {...defaultProps} />)
    // Change primary breed to Mixed
    await user.selectOptions(screen.getByDisplayValue('Beagle'), 'Mixed')
    // The second breed <select> should appear (accessible via its label)
    expect(screen.getByRole('combobox', { name: /second breed/i })).toBeInTheDocument()
  })

  it('passes Mixed breed value in onNext when no second breed is chosen', async () => {
    const onNext = vi.fn()
    const user = userEvent.setup()
    render(<VerifyInfoPanel {...defaultProps} onNext={onNext} />)
    await user.selectOptions(screen.getByDisplayValue('Beagle'), 'Mixed')
    await user.click(screen.getByRole('button', { name: /review/i }))
    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({ breed: 'Mixed' }))
  })

  it('passes Mixed + second breed in onNext when second breed is chosen', async () => {
    const onNext = vi.fn()
    const user = userEvent.setup()
    render(<VerifyInfoPanel {...defaultProps} onNext={onNext} />)
    await user.selectOptions(screen.getByDisplayValue('Beagle'), 'Mixed')
    // Select a second breed from the second dropdown
    await user.selectOptions(screen.getByRole('combobox', { name: /second breed/i }), 'Poodle')
    await user.click(screen.getByRole('button', { name: /review/i }))
    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({ breed: 'Mixed (Poodle)' }))
  })

  it('shows photo preview when "Use demo photo" is clicked', async () => {
    const user = userEvent.setup()
    render(<VerifyInfoPanel {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /use demo photo/i }))
    // The Demo label should appear below the emoji placeholder
    expect(screen.getByText('Demo')).toBeInTheDocument()
  })

  it('removes photo preview when Remove is clicked', async () => {
    const user = userEvent.setup()
    render(<VerifyInfoPanel {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /use demo photo/i }))
    expect(screen.getByText('Demo')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /remove/i }))
    expect(screen.queryByText('Demo')).not.toBeInTheDocument()
  })

  it('passes photoPreview in onNext call', async () => {
    const onNext = vi.fn()
    const user = userEvent.setup()
    render(<VerifyInfoPanel {...defaultProps} onNext={onNext} />)
    await user.click(screen.getByRole('button', { name: /use demo photo/i }))
    await user.click(screen.getByRole('button', { name: /review/i }))
    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({ photoPreview: 'demo' }))
  })
})
