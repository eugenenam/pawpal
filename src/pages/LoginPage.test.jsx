import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from './LoginPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ signIn: vi.fn(), enterDemoMode: vi.fn() })),
}))

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    render(<LoginPage />)
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
  })

  it('renders the Log In button', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('renders the Try Demo button', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /try demo/i })).toBeInTheDocument()
  })

  it('shows error message on failed login', async () => {
    const { useAuth } = await import('../context/AuthContext')
    vi.mocked(useAuth).mockReturnValue({
      signIn: vi.fn().mockRejectedValue(new Error('Invalid credentials')),
      enterDemoMode: vi.fn(),
    })
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByPlaceholderText(/email/i), 'test@test.com')
    await user.type(screen.getByPlaceholderText(/password/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /log in/i }))
    await waitFor(() => expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument())
  })
})
