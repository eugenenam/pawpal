import { supabase } from '../lib/supabase'

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function createAlert({ isDemoMode, dogId, ownerId, lat, lng, address, radiusMiles, otherDetails }) {
  const notified_count = randomBetween(40, 60)
  const shelters_notified = 3

  if (isDemoMode) {
    return {
      id: `demo-alert-${Date.now()}`,
      notified_count,
      shelters_notified,
    }
  }

  const { data, error } = await supabase
    .from('lost_dog_alerts')
    .insert({
      dog_id: dogId,
      owner_id: ownerId,
      last_seen_lat: lat,
      last_seen_lng: lng,
      last_seen_address: address,
      alert_radius_miles: radiusMiles,
      other_details: otherDetails || null,
      notified_count,
      shelters_notified,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function resolveAlert(alertId, isDemoMode) {
  if (isDemoMode) {
    return { id: alertId }
  }

  const { data, error } = await supabase
    .from('lost_dog_alerts')
    .update({ status: 'resolved', resolved_at: new Date().toISOString() })
    .eq('id', alertId)
    .select()
    .single()

  if (error) throw error
  return data
}
