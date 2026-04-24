import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignUpFlow from './SignUpFlow'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}))
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ signUp: vi.fn() }),
}))

describe('SignUpFlow', () => {
  it('renders step 1 fields on load', () => {
    render(<SignUpFlow />)
    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
  })

  it('advances to step 2 when Next is clicked with valid data', async () => {
    const user = userEvent.setup()
    render(<SignUpFlow />)
    await user.type(screen.getByPlaceholderText(/first name/i), 'Alice')
    await user.type(screen.getByPlaceholderText(/last name/i), 'Smith')
    await user.type(screen.getByPlaceholderText(/email/i), 'alice@test.com')
    await user.type(screen.getByPlaceholderText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByPlaceholderText(/dog.*name/i)).toBeInTheDocument()
  })
})
