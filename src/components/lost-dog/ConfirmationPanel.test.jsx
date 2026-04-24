import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmationPanel from './ConfirmationPanel'

const mockAlert = {
  dogName: 'Daisy',
  notified_count: 47,
  shelters_notified: 3,
  alertRadius: 2,
}

describe('ConfirmationPanel', () => {
  it('renders the alert sent heading', () => {
    render(<ConfirmationPanel alert={mockAlert} onResolve={vi.fn()} />)
    expect(screen.getByText(/alert sent/i)).toBeInTheDocument()
  })

  it('shows the notified user count', () => {
    render(<ConfirmationPanel alert={mockAlert} onResolve={vi.fn()} />)
    expect(screen.getByText(/47/)).toBeInTheDocument()
  })

  it('shows the shelters notified count', () => {
    render(<ConfirmationPanel alert={mockAlert} onResolve={vi.fn()} />)
    expect(screen.getByText(/3 shelters/)).toBeInTheDocument()
  })

  it('calls onResolve when Mark as Found is clicked', async () => {
    const onResolve = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmationPanel alert={mockAlert} onResolve={onResolve} />)
    await user.click(screen.getByRole('button', { name: /mark as found/i }))
    expect(onResolve).toHaveBeenCalled()
  })
})
