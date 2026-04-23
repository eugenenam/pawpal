import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TopNav from './TopNav'

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    isDemoMode: false,
    enterDemoMode: vi.fn(),
    signOut: vi.fn(),
  }),
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}))

describe('TopNav', () => {
  it('renders the PawPal logo', () => {
    render(<TopNav onLostDogClick={vi.fn()} />)
    expect(screen.getByText(/PawPal/i)).toBeInTheDocument()
  })

  it('renders Try Demo button', () => {
    render(<TopNav onLostDogClick={vi.fn()} />)
    expect(screen.getByText('Try Demo')).toBeInTheDocument()
  })

  it('renders Lost Dog nav link', () => {
    render(<TopNav onLostDogClick={vi.fn()} />)
    expect(screen.getByText('Lost Dog')).toBeInTheDocument()
  })
})
