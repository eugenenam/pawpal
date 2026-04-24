import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DropPinPanel from './DropPinPanel'

describe('DropPinPanel', () => {
  it('shows instruction text when no pin is set', () => {
    render(<DropPinPanel pin={null} onPinChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByText(/tap the map/i)).toBeInTheDocument()
  })

  it('disables Next button when no pin is set', () => {
    render(<DropPinPanel pin={null} onPinChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('enables Next button when pin is set', () => {
    render(
      <DropPinPanel
        pin={{ lat: 40.68, lng: -73.98, address: 'Park Slope, Brooklyn' }}
        onPinChange={vi.fn()}
        onNext={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
  })

  it('shows the pin address when set', () => {
    render(
      <DropPinPanel
        pin={{ lat: 40.68, lng: -73.98, address: 'Park Slope, Brooklyn' }}
        onPinChange={vi.fn()}
        onNext={vi.fn()}
      />
    )
    expect(screen.getByText(/Park Slope, Brooklyn/)).toBeInTheDocument()
  })

  it('calls onNext when Next button is clicked with pin set', async () => {
    const onNext = vi.fn()
    const user = userEvent.setup()
    render(
      <DropPinPanel
        pin={{ lat: 40.68, lng: -73.98, address: 'Park Slope, Brooklyn' }}
        onPinChange={vi.fn()}
        onNext={onNext}
      />
    )
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(onNext).toHaveBeenCalled()
  })
})
