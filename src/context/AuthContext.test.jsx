import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}))

function TestConsumer() {
  const { user, isDemoMode, profile, dog } = useAuth()
  return (
    <div>
      <span data-testid="user">{user ? 'logged-in' : 'logged-out'}</span>
      <span data-testid="demo">{isDemoMode ? 'demo' : 'not-demo'}</span>
      <span data-testid="profile">{profile?.full_name ?? 'no-profile'}</span>
      <span data-testid="dog">{dog?.name ?? 'no-dog'}</span>
    </div>
  )
}

function TestDemoButton() {
  const { enterDemoMode } = useAuth()
  return <button onClick={enterDemoMode}>Try Demo</button>
}

describe('AuthContext', () => {
  it('starts logged out', async () => {
    await act(async () => {
      render(<AuthProvider><TestConsumer /></AuthProvider>)
    })
    expect(screen.getByTestId('user')).toHaveTextContent('logged-out')
    expect(screen.getByTestId('demo')).toHaveTextContent('not-demo')
  })

  it('enterDemoMode sets Alice and Daisy', async () => {
    await act(async () => {
      render(<AuthProvider><TestConsumer /><TestDemoButton /></AuthProvider>)
    })
    await act(async () => {
      screen.getByText('Try Demo').click()
    })
    expect(screen.getByTestId('demo')).toHaveTextContent('demo')
    expect(screen.getByTestId('profile')).toHaveTextContent('Anxious Alice')
    expect(screen.getByTestId('dog')).toHaveTextContent('Daisy')
  })
})
