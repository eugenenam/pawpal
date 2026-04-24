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
    expect(screen.getByText(/\+47 users notified/)).toBeInTheDocument()
  })

  it('shows the shelters notified count', () => {
    render(<ConfirmationPanel alert={mockAlert} onResolve={vi.fn()} />)
    expect(screen.getByText(/3 shelters/)).toBeInTheDocument()
  })

  it('renders the 3 Brooklyn shelter names', () => {
    render(<ConfirmationPanel alert={mockAlert} onResolve={vi.fn()} />)
    expect(screen.getByText('Brooklyn Paws Rescue')).toBeInTheDocument()
    expect(screen.getByText('Prospect Heights Animal Care')).toBeInTheDocument()
    expect(screen.getByText('Bay Ridge Pet Haven')).toBeInTheDocument()
  })

  it('renders shelter addresses', () => {
    render(<ConfirmationPanel alert={mockAlert} onResolve={vi.fn()} />)
    expect(screen.getByText('147 Bedford Ave, Brooklyn, NY 11211')).toBeInTheDocument()
    expect(screen.getByText('89 Vanderbilt Ave, Brooklyn, NY 11205')).toBeInTheDocument()
    expect(screen.getByText('412 86th St, Brooklyn, NY 11209')).toBeInTheDocument()
  })

  it('renders shelter phone numbers as tel links', () => {
    render(<ConfirmationPanel alert={mockAlert} onResolve={vi.fn()} />)
    const phoneLinks = screen.getAllByRole('link')
    expect(phoneLinks).toHaveLength(3)
    expect(phoneLinks[0]).toHaveAttribute('href', 'tel:+17185550192')
    expect(phoneLinks[1]).toHaveAttribute('href', 'tel:+17185550347')
    expect(phoneLinks[2]).toHaveAttribute('href', 'tel:+17185550581')
  })

  it('calls onResolve when Mark as Found is clicked', async () => {
    const onResolve = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmationPanel alert={mockAlert} onResolve={onResolve} />)
    await user.click(screen.getByRole('button', { name: /mark as found/i }))
    expect(onResolve).toHaveBeenCalled()
  })
})
