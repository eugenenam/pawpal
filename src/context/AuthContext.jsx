import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Hardcoded demo profile and dog — not a real user, no Supabase rows involved.
// Phone number is fictional; shown in the UI to illustrate the profile feature.
const DEMO_PROFILE = { id: 'demo', full_name: 'Anxious Alice', phone: '(917) 123-4567' }
const DEMO_DOG = {
  id: 'demo-dog',
  owner_id: 'demo',
  name: 'Daisy',
  breed: 'Beagle',
  color: 'Tri-Color (Black/Brown/White)',
  age_years: 3,
  gender: 'female',
  weight_lbs: 21,
  microchip_number: 'SDD2ADF3164D',
  photo_url: null,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [dog, setDog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadUserData(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadUserData(session.user.id)
      else { setProfile(null); setDog(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserData(userId) {
    const [{ data: profileData }, { data: dogData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('dogs').select('*').eq('owner_id', userId).single(),
    ])
    setProfile(profileData)
    setDog(dogData)
    setLoading(false)
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp({ email, password, fullName, phone, dogName, dogBreed, dogGender, dogAgeYears }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error

    if (phone) {
      await supabase.from('profiles').update({ phone }).eq('id', data.user.id)
    }

    const { error: dogError } = await supabase.from('dogs').insert({
      owner_id: data.user.id,
      name: dogName,
      breed: dogBreed,
      gender: dogGender,
      age_years: dogAgeYears,
      color: '',
    })
    if (dogError) throw dogError
  }

  async function signOut() {
    if (isDemoMode) {
      setIsDemoMode(false)
      setUser(null)
      setProfile(null)
      setDog(null)
      return
    }
    await supabase.auth.signOut()
  }

  function enterDemoMode() {
    setIsDemoMode(true)
    setUser({ id: 'demo' })
    setProfile(DEMO_PROFILE)
    setDog(DEMO_DOG)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, profile, dog, loading, isDemoMode, signIn, signUp, signOut, enterDemoMode }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
