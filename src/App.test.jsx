import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

vi.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({ user: null, loading: false, isDemoMode: false }),
}))

vi.mock('./pages/MainApp', () => ({ default: () => <div>Main App</div> }))
vi.mock('./pages/LoginPage', () => ({ default: () => <div>Login Page</div> }))
vi.mock('./pages/SignUpFlow', () => ({ default: () => <div>Signup Page</div> }))

describe('App routing', () => {
  it('redirects unauthenticated users from / to /login', () => {
    render(<App />)
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })
})
