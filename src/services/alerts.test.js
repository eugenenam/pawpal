import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { createAlert, resolveAlert } from './alerts'
import { supabase } from '../lib/supabase'

describe('alerts service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createAlert returns simulated count in demo mode', async () => {
    const result = await createAlert({ isDemoMode: true, dogId: 'demo-dog', ownerId: 'demo', lat: 40.68, lng: -73.98, radiusMiles: 2 })
    expect(result.notified_count).toBeGreaterThanOrEqual(40)
    expect(result.notified_count).toBeLessThanOrEqual(60)
    expect(result.shelters_notified).toBe(3)
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('createAlert inserts into Supabase when not in demo mode', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: 'alert-1', notified_count: 47, shelters_notified: 3 },
      error: null,
    })
    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({ single: mockSingle })
      })
    })

    const result = await createAlert({
      isDemoMode: false, dogId: 'dog-1', ownerId: 'user-1',
      lat: 40.68, lng: -73.98, address: 'Brooklyn', radiusMiles: 2, otherDetails: '',
    })
    expect(supabase.from).toHaveBeenCalledWith('lost_dog_alerts')
    expect(result).toHaveProperty('id')
  })

  it('resolveAlert returns id in demo mode without hitting Supabase', async () => {
    const result = await resolveAlert('alert-1', true)
    expect(result.id).toBe('alert-1')
    expect(supabase.from).not.toHaveBeenCalled()
  })
})
