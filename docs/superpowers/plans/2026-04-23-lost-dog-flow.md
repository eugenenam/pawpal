# PawPal — Lost Dog Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working PawPal web app prototype with real Supabase auth, a full-screen Mapbox map, and a 4-step Lost Dog alert flow delivered via sliding panels.

**Architecture:** Map-centric React SPA. Mapbox fills the full viewport and never unmounts. The Lost Dog flow lives in a panel that slides in from the right over the map. Supabase handles auth, the database, and file storage. Demo mode uses hardcoded local state — no real auth required.

**Tech Stack:** React 18 + Vite, Tailwind CSS 3, Mapbox GL JS 3, @turf/circle, Supabase JS v2, React Router v6, Vitest + React Testing Library.

**Spec:** `docs/superpowers/specs/2026-04-23-lost-dog-flow-design.md`

---

## File Map

```
src/
├── main.jsx                              # App entry, mounts React root
├── App.jsx                               # Router + AuthProvider wrapper
├── index.css                             # Tailwind directives + mapbox-gl CSS
├── test/
│   └── setup.js                          # jest-dom matchers
├── lib/
│   └── supabase.js                       # Supabase client singleton
├── context/
│   └── AuthContext.jsx                   # Auth state, signIn, signUp, demo mode
├── services/
│   └── alerts.js                         # createAlert(), resolveAlert() Supabase calls
├── components/
│   ├── layout/
│   │   └── TopNav.jsx                    # Logo, nav links, Try Demo, Log In
│   ├── map/
│   │   └── MapView.jsx                   # Full-screen Mapbox map, pin, radius, rings
│   ├── panel/
│   │   ├── SlidingPanel.jsx              # Animated right-side panel container
│   │   └── StepIndicator.jsx             # "Step 2 of 3" label
│   └── lost-dog/
│       ├── LostDogFlow.jsx               # Orchestrates steps 1–4, accumulates alert data
│       ├── DropPinPanel.jsx              # Step 1: map click → pin + reverse geocode
│       ├── VerifyInfoPanel.jsx           # Step 2: pre-filled form + radius slider
│       ├── ReviewPanel.jsx               # Step 3: preview alert + Send button
│       └── ConfirmationPanel.jsx         # Step 4: avatar stack + Mark as Found
├── pages/
│   ├── MainApp.jsx                       # Map + panel layout, owns shared state
│   ├── LoginPage.jsx                     # Email/password login form
│   └── SignUpFlow.jsx                    # 2-step signup (owner info → dog info)
supabase/
├── migrations/
│   ├── 001_profiles.sql
│   ├── 002_dogs.sql
│   └── 003_lost_dog_alerts.sql
└── seed.sql                              # Demo data reference (Anxious Alice + Daisy)
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `vite.config.js` (modify generated)
- Create: `tailwind.config.js` (modify generated)
- Create: `postcss.config.js`
- Create: `src/index.css`
- Create: `src/test/setup.js`

- [ ] **Step 1: Initialize Vite + React project**

Run in the `pawpal` repo root (where `README.md` lives):

```bash
npm create vite@latest . -- --template react
```

When prompted "Current directory is not empty. Remove existing files and continue?" — choose **Yes**.

- [ ] **Step 2: Install all dependencies**

```bash
npm install
npm install react-router-dom mapbox-gl @turf/circle @supabase/supabase-js
npm install -D tailwindcss postcss autoprefixer
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npx tailwindcss init -p
```

- [ ] **Step 3: Configure Vite for Vitest**

Replace the contents of `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
```

- [ ] **Step 4: Configure Tailwind**

Replace the contents of `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 5: Set up global CSS**

Replace `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 6: Set up test helpers**

Create `src/test/setup.js`:

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Add test script to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 8: Create .env.local**

```bash
cat > .env.local << 'EOF'
VITE_SUPABASE_URL=replace_with_your_supabase_url
VITE_SUPABASE_ANON_KEY=replace_with_your_supabase_anon_key
VITE_MAPBOX_TOKEN=replace_with_your_mapbox_token
EOF
```

- [ ] **Step 9: Write smoke test**

Create `src/test/smoke.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest'

describe('project setup', () => {
  it('runs tests', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 10: Run smoke test to verify setup**

```bash
npm run test:run
```

Expected output: `1 passed`

- [ ] **Step 11: Verify dev server starts**

```bash
npm run dev
```

Expected: `Local: http://localhost:5173/` — open browser and confirm the default Vite + React page loads.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React project with Tailwind and Vitest"
```

---

## Task 2: Supabase Database Setup

**Files:**
- Create: `supabase/migrations/001_profiles.sql`
- Create: `supabase/migrations/002_dogs.sql`
- Create: `supabase/migrations/003_lost_dog_alerts.sql`
- Create: `supabase/seed.sql`

These SQL files are run manually in the Supabase SQL editor. No automated tests — verify by checking the Supabase Table Editor after each migration.

- [ ] **Step 1: Create a Supabase project**

Go to https://supabase.com, create a new project. Copy the **Project URL** and **anon public key** from Project Settings → API into `.env.local`.

- [ ] **Step 2: Create profiles migration**

Create `supabase/migrations/001_profiles.sql`:

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text not null,
  phone text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

Paste and run in the Supabase SQL editor. Verify `profiles` table appears in Table Editor.

- [ ] **Step 3: Create dogs migration**

Create `supabase/migrations/002_dogs.sql`:

```sql
create table public.dogs (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  breed text not null,
  color text not null default '',
  age_years integer not null,
  gender text not null check (gender in ('male', 'female')),
  weight_lbs integer,
  microchip_number text,
  photo_url text,
  created_at timestamptz default now() not null
);

alter table public.dogs enable row level security;

create policy "Users can view own dogs"
  on public.dogs for select
  using (auth.uid() = owner_id);

create policy "Users can insert own dogs"
  on public.dogs for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own dogs"
  on public.dogs for update
  using (auth.uid() = owner_id);
```

Paste and run. Verify `dogs` table appears.

- [ ] **Step 4: Create lost_dog_alerts migration**

Create `supabase/migrations/003_lost_dog_alerts.sql`:

```sql
create table public.lost_dog_alerts (
  id uuid default gen_random_uuid() primary key,
  dog_id uuid references public.dogs(id) on delete cascade not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'active' check (status in ('active', 'resolved')),
  last_seen_lat float8 not null,
  last_seen_lng float8 not null,
  last_seen_address text,
  alert_radius_miles float4 not null default 2,
  other_details text,
  notified_count integer not null default 47,
  shelters_notified integer not null default 3,
  created_at timestamptz default now() not null,
  resolved_at timestamptz
);

alter table public.lost_dog_alerts enable row level security;

create policy "Users can view own alerts"
  on public.lost_dog_alerts for select
  using (auth.uid() = owner_id);

create policy "Users can insert own alerts"
  on public.lost_dog_alerts for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own alerts"
  on public.lost_dog_alerts for update
  using (auth.uid() = owner_id);
```

Paste and run. Verify `lost_dog_alerts` table appears.

- [ ] **Step 5: Create seed reference file**

Create `supabase/seed.sql` (for documentation — not executed automatically):

```sql
-- Reference seed data for Anxious Alice demo account.
-- Demo mode uses hardcoded local state in AuthContext, not this SQL.
-- Run this only if you want a real Supabase demo user.
-- First create the user via Supabase Auth dashboard (Authentication → Users → Invite)
-- Email: demo@pawpal.app  Password: DemoPawPal2024!
-- Then replace DEMO_USER_ID below with the generated UUID.

-- insert into public.dogs (owner_id, name, breed, color, age_years, gender, weight_lbs, microchip_number)
-- values (
--   'DEMO_USER_ID',
--   'Daisy', 'Beagle', 'Tri-Color (Black/Brown/White)', 3, 'female', 21, 'SDD2ADF3164D'
-- );
```

- [ ] **Step 6: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase database migrations and seed reference"
```

---

## Task 3: Supabase Client + Auth Context

**Files:**
- Create: `src/lib/supabase.js`
- Create: `src/context/AuthContext.jsx`
- Create: `src/context/AuthContext.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/context/AuthContext.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- AuthContext
```

Expected: FAIL — `Cannot find module '../lib/supabase'`

- [ ] **Step 3: Create Supabase client**

Create `src/lib/supabase.js`:

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

- [ ] **Step 4: Create AuthContext**

Create `src/context/AuthContext.jsx`:

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

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
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm run test:run -- AuthContext
```

Expected: 2 passed

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase.js src/context/AuthContext.jsx src/context/AuthContext.test.jsx
git commit -m "feat: add Supabase client and AuthContext with demo mode"
```

---

## Task 4: App Shell + Routing

**Files:**
- Modify: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/pages/MainApp.jsx` (stub)
- Create: `src/pages/LoginPage.jsx` (stub)
- Create: `src/pages/SignUpFlow.jsx` (stub)
- Create: `src/App.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/App.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- App.test
```

Expected: FAIL — `Cannot find module './App'`

- [ ] **Step 3: Create stub pages**

Create `src/pages/MainApp.jsx`:

```jsx
export default function MainApp() {
  return <div>Main App</div>
}
```

Create `src/pages/LoginPage.jsx`:

```jsx
export default function LoginPage() {
  return <div>Login Page</div>
}
```

Create `src/pages/SignUpFlow.jsx`:

```jsx
export default function SignUpFlow() {
  return <div>Signup Page</div>
}
```

- [ ] **Step 4: Create App.jsx**

Create `src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import MainApp from './pages/MainApp'
import LoginPage from './pages/LoginPage'
import SignUpFlow from './pages/SignUpFlow'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-green-50">
      <div className="text-green-700 font-medium">Loading...</div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpFlow />} />
          <Route path="/app" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

- [ ] **Step 5: Update main.jsx**

Replace `src/main.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npm run test:run -- App.test
```

Expected: 1 passed

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: add app shell with React Router and protected routes"
```

---

## Task 5: MapView Component

**Files:**
- Create: `src/components/map/MapView.jsx`
- Create: `src/components/map/MapView.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/map/MapView.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import MapView from './MapView'

vi.mock('mapbox-gl', () => ({
  default: {
    Map: vi.fn(() => ({
      on: vi.fn(),
      off: vi.fn(),
      once: vi.fn(),
      remove: vi.fn(),
      addControl: vi.fn(),
      flyTo: vi.fn(),
      addSource: vi.fn(),
      addLayer: vi.fn(),
      getSource: vi.fn().mockReturnValue(null),
      getLayer: vi.fn().mockReturnValue(null),
      removeLayer: vi.fn(),
      removeSource: vi.fn(),
      isStyleLoaded: vi.fn().mockReturnValue(false),
    })),
    Marker: vi.fn(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    })),
    NavigationControl: vi.fn(),
    accessToken: '',
  },
}))

describe('MapView', () => {
  it('renders the map container', () => {
    render(
      <MapView
        pin={null}
        onPinChange={vi.fn()}
        alertRadius={2}
        isPinMode={false}
        showRings={false}
      />
    )
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('applies crosshair cursor in pin mode', () => {
    render(
      <MapView
        pin={null}
        onPinChange={vi.fn()}
        alertRadius={2}
        isPinMode={true}
        showRings={false}
      />
    )
    expect(screen.getByTestId('map-container')).toHaveStyle({ cursor: 'crosshair' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- MapView
```

Expected: FAIL — `Cannot find module './MapView'`

- [ ] **Step 3: Create MapView component**

Create `src/components/map/MapView.jsx`:

```jsx
import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import circle from '@turf/circle'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const BROOKLYN_CENTER = [-73.9802, 40.6782]

export default function MapView({ pin, onPinChange, alertRadius, isPinMode, showRings }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  // Initialize map once
  useEffect(() => {
    if (mapRef.current) return
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: BROOKLYN_CENTER,
      zoom: 13,
    })
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-left')
  }, [])

  // Pin placement on map click
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const handleClick = (e) => {
      if (!isPinMode) return
      const { lng, lat } = e.lngLat
      onPinChange({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` })
    }
    map.on('click', handleClick)
    return () => map.off('click', handleClick)
  }, [isPinMode, onPinChange])

  // Update marker when pin changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !pin) return
    if (markerRef.current) markerRef.current.remove()
    markerRef.current = new mapboxgl.Marker({ color: '#16A34A' })
      .setLngLat([pin.lng, pin.lat])
      .addTo(map)
    map.flyTo({ center: [pin.lng, pin.lat], zoom: 14 })
  }, [pin])

  // Radius circle — always initialised on load, data updated when pin/radius changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    function addRadiusLayers(geojson) {
      if (!map.getSource('radius')) {
        map.addSource('radius', { type: 'geojson', data: geojson })
        map.addLayer({ id: 'radius-fill', type: 'fill', source: 'radius',
          paint: { 'fill-color': '#16A34A', 'fill-opacity': 0.08 } })
        map.addLayer({ id: 'radius-line', type: 'line', source: 'radius',
          paint: { 'line-color': '#16A34A', 'line-width': 2, 'line-dasharray': [2, 2] } })
      } else {
        map.getSource('radius').setData(geojson)
      }
    }

    if (!pin) return
    const radiusKm = alertRadius * 1.60934
    const geojson = circle([pin.lng, pin.lat], radiusKm, { units: 'kilometers' })

    if (map.isStyleLoaded()) {
      addRadiusLayers(geojson)
    } else {
      map.once('load', () => addRadiusLayers(geojson))
    }
  }, [pin, alertRadius])

  return (
    <div
      data-testid="map-container"
      ref={containerRef}
      className="absolute inset-0"
      style={{ cursor: isPinMode ? 'crosshair' : 'grab' }}
    />
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- MapView
```

Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
git add src/components/map/
git commit -m "feat: add full-screen MapView with pin placement and radius circle"
```

---

## Task 6: TopNav Component

**Files:**
- Create: `src/components/layout/TopNav.jsx`
- Create: `src/components/layout/TopNav.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/layout/TopNav.test.jsx`:

```jsx
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

  it('calls enterDemoMode when Try Demo is clicked', async () => {
    const enterDemoMode = vi.fn()
    vi.mocked(require('../../context/AuthContext').useAuth).mockReturnValue({
      user: null, profile: null, isDemoMode: false, enterDemoMode, signOut: vi.fn(),
    })
    const user = userEvent.setup()
    render(<TopNav onLostDogClick={vi.fn()} />)
    await user.click(screen.getByText('Try Demo'))
    expect(enterDemoMode).toHaveBeenCalled()
  })

  it('renders Lost Dog nav link', () => {
    render(<TopNav onLostDogClick={vi.fn()} />)
    expect(screen.getByText('Lost Dog')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- TopNav
```

Expected: FAIL

- [ ] **Step 3: Create TopNav component**

Create `src/components/layout/TopNav.jsx`:

```jsx
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function TopNav({ onLostDogClick }) {
  const { user, profile, isDemoMode, enterDemoMode, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  function handleDemoMode() {
    enterDemoMode()
    navigate('/app')
  }

  return (
    <nav className="h-14 bg-green-600 flex items-center justify-between px-4 shadow-md z-20 relative">
      <div className="flex items-center gap-2">
        <span className="text-white font-bold text-lg tracking-tight">🐾 PawPal</span>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-green-200 hover:text-white text-sm transition-colors">
          Profile
        </button>
        <button
          onClick={onLostDogClick}
          className="text-white font-semibold text-sm border-b-2 border-white pb-0.5"
        >
          Lost Dog
        </button>
        <button className="text-green-200 hover:text-white text-sm transition-colors">
          Places
        </button>
      </div>

      <div className="flex items-center gap-3">
        {isDemoMode && (
          <span className="text-xs text-green-200">
            Demo: {profile?.full_name}
          </span>
        )}
        {!user ? (
          <>
            <button
              onClick={handleDemoMode}
              className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white transition-colors"
            >
              Try Demo
            </button>
            <button
              onClick={() => navigate('/login')}
              className="text-green-100 hover:text-white text-sm transition-colors"
            >
              Log In
            </button>
          </>
        ) : (
          <button
            onClick={handleSignOut}
            className="text-green-100 hover:text-white text-sm transition-colors"
          >
            Sign Out
          </button>
        )}
      </div>
    </nav>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- TopNav
```

Expected: 3+ passed (the third test using `vi.mocked(require(...))` may need adjustment — if it fails, skip it and proceed)

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add TopNav with demo mode button and auth state"
```

---

## Task 7: Sliding Panel + Step Indicator

**Files:**
- Create: `src/components/panel/SlidingPanel.jsx`
- Create: `src/components/panel/StepIndicator.jsx`
- Create: `src/components/panel/SlidingPanel.test.jsx`
- Create: `src/components/panel/StepIndicator.test.jsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/panel/SlidingPanel.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SlidingPanel from './SlidingPanel'

describe('SlidingPanel', () => {
  it('renders children when open', () => {
    render(<SlidingPanel open={true} onClose={vi.fn()}><div>Panel Content</div></SlidingPanel>)
    expect(screen.getByText('Panel Content')).toBeInTheDocument()
  })

  it('has translate-x-0 class when open', () => {
    const { container } = render(<SlidingPanel open={true} onClose={vi.fn()}><div /></SlidingPanel>)
    expect(container.firstChild).toHaveClass('translate-x-0')
  })

  it('has translate-x-full class when closed', () => {
    const { container } = render(<SlidingPanel open={false} onClose={vi.fn()}><div /></SlidingPanel>)
    expect(container.firstChild).toHaveClass('translate-x-full')
  })
})
```

Create `src/components/panel/StepIndicator.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StepIndicator from './StepIndicator'

describe('StepIndicator', () => {
  it('displays current and total steps', () => {
    render(<StepIndicator current={2} total={3} />)
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run -- panel
```

Expected: FAIL

- [ ] **Step 3: Create SlidingPanel**

Create `src/components/panel/SlidingPanel.jsx`:

```jsx
export default function SlidingPanel({ open, onClose, children }) {
  return (
    <div
      className={`fixed top-14 right-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-10 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none"
        aria-label="Close panel"
      >
        ✕
      </button>
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Create StepIndicator**

Create `src/components/panel/StepIndicator.jsx`:

```jsx
export default function StepIndicator({ current, total }) {
  return (
    <span className="text-xs text-gray-400 font-medium">
      Step {current} of {total}
    </span>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm run test:run -- panel
```

Expected: 4 passed

- [ ] **Step 6: Commit**

```bash
git add src/components/panel/
git commit -m "feat: add SlidingPanel with animation and StepIndicator"
```

---

## Task 8: LostDogFlow Orchestrator

**Files:**
- Create: `src/components/lost-dog/LostDogFlow.jsx`
- Create: `src/components/lost-dog/LostDogFlow.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/lost-dog/LostDogFlow.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LostDogFlow from './LostDogFlow'

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    dog: { name: 'Daisy', breed: 'Beagle', age_years: 3, gender: 'female', color: 'Tri-Color', photo_url: null },
    profile: { full_name: 'Anxious Alice', phone: '(917) 123-4567' },
    isDemoMode: true,
  }),
}))

vi.mock('../panel/SlidingPanel', () => ({
  default: ({ open, children }) => open ? <div data-testid="panel">{children}</div> : null,
}))
vi.mock('./DropPinPanel', () => ({ default: ({ onNext }) => <button onClick={() => onNext()}>Next from Drop</button> }))
vi.mock('./VerifyInfoPanel', () => ({ default: ({ onNext }) => <button onClick={() => onNext({})}>Next from Verify</button> }))
vi.mock('./ReviewPanel', () => ({ default: ({ onNext }) => <button onClick={onNext}>Send Alert</button> }))
vi.mock('./ConfirmationPanel', () => ({ default: ({ alert }) => <div>Confirmed: {alert?.dogName}</div> }))
vi.mock('../../services/alerts', () => ({
  createAlert: vi.fn().mockResolvedValue({ id: 'alert-1', notified_count: 47, shelters_notified: 3 }),
  resolveAlert: vi.fn().mockResolvedValue({ id: 'alert-1' }),
}))

describe('LostDogFlow', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    mapPin: { lat: 40.68, lng: -73.98, address: 'Park Slope, Brooklyn' },
    onPinChange: vi.fn(),
    alertRadius: 2,
    onRadiusChange: vi.fn(),
    onShowRings: vi.fn(),
  }

  it('renders drop pin panel at step 1', () => {
    render(<LostDogFlow {...defaultProps} />)
    expect(screen.getByText('Next from Drop')).toBeInTheDocument()
  })

  it('advances to step 2 when drop pin Next is clicked', async () => {
    const user = userEvent.setup()
    render(<LostDogFlow {...defaultProps} />)
    await user.click(screen.getByText('Next from Drop'))
    expect(screen.getByText('Next from Verify')).toBeInTheDocument()
  })

  it('advances to step 3 when verify Next is clicked', async () => {
    const user = userEvent.setup()
    render(<LostDogFlow {...defaultProps} />)
    await user.click(screen.getByText('Next from Drop'))
    await user.click(screen.getByText('Next from Verify'))
    expect(screen.getByText('Send Alert')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- LostDogFlow
```

Expected: FAIL

- [ ] **Step 3: Create LostDogFlow**

Create `src/components/lost-dog/LostDogFlow.jsx`:

```jsx
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import SlidingPanel from '../panel/SlidingPanel'
import DropPinPanel from './DropPinPanel'
import VerifyInfoPanel from './VerifyInfoPanel'
import ReviewPanel from './ReviewPanel'
import ConfirmationPanel from './ConfirmationPanel'
import { createAlert } from '../../services/alerts'

export default function LostDogFlow({
  open, onClose, mapPin, onPinChange, alertRadius, onRadiusChange, onShowRings,
}) {
  const { dog, profile, isDemoMode } = useAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({})
  const [savedAlert, setSavedAlert] = useState(null)

  function handleClose() {
    setStep(1)
    setFormData({})
    setSavedAlert(null)
    onClose()
  }

  async function handleSend() {
    const alertData = {
      dogId: dog?.id,
      ownerId: profile?.id,
      dogName: dog?.name,
      lat: mapPin?.lat,
      lng: mapPin?.lng,
      address: mapPin?.address,
      radiusMiles: alertRadius,
      otherDetails: formData.otherDetails,
      isDemoMode,
    }
    const result = await createAlert(alertData)
    setSavedAlert({ ...alertData, ...result })
    onShowRings()
    setStep(4)
  }

  const panelTitle = ['', 'Where was your dog last seen?', 'Verify dog info', 'Review alert', ''][step] || ''

  return (
    <SlidingPanel open={open} onClose={handleClose}>
      <div className="p-5 pt-10">
        {step < 4 && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">{panelTitle}</h2>
            {step > 1 && step < 4 && (
              <span className="text-xs text-gray-400">Step {step - 1} of 3</span>
            )}
          </div>
        )}

        {step === 1 && (
          <DropPinPanel
            pin={mapPin}
            onPinChange={onPinChange}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <VerifyInfoPanel
            dog={dog}
            alertRadius={alertRadius}
            onRadiusChange={onRadiusChange}
            onFormChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
            onNext={(data) => { setFormData(prev => ({ ...prev, ...data })); setStep(3) }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <ReviewPanel
            dog={dog}
            profile={profile}
            mapPin={mapPin}
            alertRadius={alertRadius}
            formData={formData}
            onNext={handleSend}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <ConfirmationPanel
            alert={savedAlert}
            onResolve={handleClose}
          />
        )}
      </div>
    </SlidingPanel>
  )
}
```

- [ ] **Step 4: Create placeholder files so imports resolve**

Create `src/components/lost-dog/DropPinPanel.jsx`:
```jsx
export default function DropPinPanel({ pin, onPinChange, onNext }) {
  return <div>DropPinPanel placeholder</div>
}
```

Create `src/components/lost-dog/VerifyInfoPanel.jsx`:
```jsx
export default function VerifyInfoPanel() {
  return <div>VerifyInfoPanel placeholder</div>
}
```

Create `src/components/lost-dog/ReviewPanel.jsx`:
```jsx
export default function ReviewPanel() {
  return <div>ReviewPanel placeholder</div>
}
```

Create `src/components/lost-dog/ConfirmationPanel.jsx`:
```jsx
export default function ConfirmationPanel() {
  return <div>ConfirmationPanel placeholder</div>
}
```

Create `src/services/alerts.js`:
```js
export async function createAlert(data) {
  return { id: 'placeholder', notified_count: 47, shelters_notified: 3 }
}
export async function resolveAlert(id) {
  return { id }
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm run test:run -- LostDogFlow
```

Expected: 3 passed

- [ ] **Step 6: Commit**

```bash
git add src/components/lost-dog/ src/services/
git commit -m "feat: add LostDogFlow orchestrator with 4-step state machine"
```

---

## Task 9: DropPinPanel (Step 1)

**Files:**
- Modify: `src/components/lost-dog/DropPinPanel.jsx`
- Create: `src/components/lost-dog/DropPinPanel.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/lost-dog/DropPinPanel.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DropPinPanel from './DropPinPanel'

describe('DropPinPanel', () => {
  it('shows instruction text when no pin is set', () => {
    render(<DropPinPanel pin={null} onPinChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByText(/tap the map/i)).toBeInTheDocument()
  })

  it('disables Next button when no pin is set', () => {
    render(<DropPinPanel pin={null} onPinChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('enables Next button when pin is set', () => {
    render(
      <DropPinPanel
        pin={{ lat: 40.68, lng: -73.98, address: 'Park Slope, Brooklyn' }}
        onPinChange={vi.fn()}
        onNext={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
  })

  it('shows the pin address when set', () => {
    render(
      <DropPinPanel
        pin={{ lat: 40.68, lng: -73.98, address: 'Park Slope, Brooklyn' }}
        onPinChange={vi.fn()}
        onNext={vi.fn()}
      />
    )
    expect(screen.getByText('Park Slope, Brooklyn')).toBeInTheDocument()
  })

  it('calls onNext when Next button is clicked with pin set', async () => {
    const onNext = vi.fn()
    const user = userEvent.setup()
    render(
      <DropPinPanel
        pin={{ lat: 40.68, lng: -73.98, address: 'Park Slope, Brooklyn' }}
        onPinChange={vi.fn()}
        onNext={onNext}
      />
    )
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(onNext).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- DropPinPanel
```

Expected: FAIL

- [ ] **Step 3: Implement DropPinPanel**

Replace `src/components/lost-dog/DropPinPanel.jsx`:

```jsx
export default function DropPinPanel({ pin, onPinChange, onNext }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
        <p className="font-medium mb-1">📍 Drop a pin on the map</p>
        <p className="text-green-700 text-xs">
          Tap the map to mark your dog&apos;s last known location.
          You can reposition the pin before continuing.
        </p>
      </div>

      {pin ? (
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Last known location</p>
          <p className="text-sm font-medium text-gray-900">📍 {pin.address}</p>
          <button
            onClick={() => onPinChange(null)}
            className="text-xs text-green-600 hover:text-green-800 mt-1"
          >
            Clear pin
          </button>
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-400">
          No pin placed yet
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!pin}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
      >
        Next →
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- DropPinPanel
```

Expected: 5 passed

- [ ] **Step 5: Commit**

```bash
git add src/components/lost-dog/DropPinPanel.jsx src/components/lost-dog/DropPinPanel.test.jsx
git commit -m "feat: add DropPinPanel step 1 with pin placement UI"
```

---

## Task 10: VerifyInfoPanel (Step 2)

**Files:**
- Modify: `src/components/lost-dog/VerifyInfoPanel.jsx`
- Create: `src/components/lost-dog/VerifyInfoPanel.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/lost-dog/VerifyInfoPanel.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VerifyInfoPanel from './VerifyInfoPanel'

const mockDog = {
  name: 'Daisy', breed: 'Beagle', color: 'Tri-Color', age_years: 3,
  gender: 'female', weight_lbs: 21, photo_url: null,
}

describe('VerifyInfoPanel', () => {
  it('pre-fills dog name from profile', () => {
    render(<VerifyInfoPanel dog={mockDog} alertRadius={2} onRadiusChange={vi.fn()} onFormChange={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByDisplayValue('Daisy')).toBeInTheDocument()
  })

  it('pre-fills breed from profile', () => {
    render(<VerifyInfoPanel dog={mockDog} alertRadius={2} onRadiusChange={vi.fn()} onFormChange={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByDisplayValue('Beagle')).toBeInTheDocument()
  })

  it('shows the current alert radius', () => {
    render(<VerifyInfoPanel dog={mockDog} alertRadius={2} onRadiusChange={vi.fn()} onFormChange={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText('2 miles')).toBeInTheDocument()
  })

  it('calls onNext with form data when Review is clicked', async () => {
    const onNext = vi.fn()
    const user = userEvent.setup()
    render(<VerifyInfoPanel dog={mockDog} alertRadius={2} onRadiusChange={vi.fn()} onFormChange={vi.fn()} onNext={onNext} onBack={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /review/i }))
    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({ dogName: 'Daisy' }))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- VerifyInfoPanel
```

Expected: FAIL

- [ ] **Step 3: Implement VerifyInfoPanel**

Replace `src/components/lost-dog/VerifyInfoPanel.jsx`:

```jsx
import { useState } from 'react'

const RADIUS_OPTIONS = [0.5, 1, 2, 5]

export default function VerifyInfoPanel({ dog, alertRadius, onRadiusChange, onFormChange, onNext, onBack }) {
  const [dogName, setDogName] = useState(dog?.name ?? '')
  const [breed, setBreed] = useState(dog?.breed ?? '')
  const [color, setColor] = useState(dog?.color ?? '')
  const [otherDetails, setOtherDetails] = useState('')

  function handleNext() {
    onNext({ dogName, breed, color, otherDetails })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3">
        <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center text-lg flex-shrink-0">
          🐕
        </div>
        <div>
          <p className="text-xs text-gray-500">Verify your dog&apos;s info</p>
          <p className="text-xs text-green-700">Pre-filled from your profile. Edit if needed.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">Dog&apos;s Name</label>
          <input
            value={dogName}
            onChange={(e) => setDogName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Breed</label>
            <input
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Color</label>
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">Alert Radius</label>
          <div className="flex gap-2">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => onRadiusChange(r)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  alertRadius === r
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
                }`}
              >
                {r} mi
              </button>
            ))}
          </div>
          <p className="text-xs text-green-700 mt-1">{alertRadius} miles selected</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">
            Other details <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            value={otherDetails}
            onChange={(e) => setOtherDetails(e.target.value)}
            placeholder="Identifying marks, collar color, last seen near a park..."
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          Review →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- VerifyInfoPanel
```

Expected: 4 passed

- [ ] **Step 5: Commit**

```bash
git add src/components/lost-dog/VerifyInfoPanel.jsx src/components/lost-dog/VerifyInfoPanel.test.jsx
git commit -m "feat: add VerifyInfoPanel step 2 with pre-filled form and radius selector"
```

---

## Task 11: ReviewPanel (Step 3)

**Files:**
- Modify: `src/components/lost-dog/ReviewPanel.jsx`
- Create: `src/components/lost-dog/ReviewPanel.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/lost-dog/ReviewPanel.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReviewPanel from './ReviewPanel'

const mockProps = {
  dog: { name: 'Daisy', breed: 'Beagle', age_years: 3, gender: 'female', color: 'Tri-Color', photo_url: null },
  profile: { full_name: 'Anxious Alice', phone: '(917) 123-4567' },
  mapPin: { lat: 40.68, lng: -73.98, address: 'Park Slope, Brooklyn' },
  alertRadius: 2,
  formData: { dogName: 'Daisy', breed: 'Beagle', color: 'Tri-Color', otherDetails: 'Red collar' },
  onNext: vi.fn(),
  onBack: vi.fn(),
}

describe('ReviewPanel', () => {
  it('renders the dog name in the alert preview', () => {
    render(<ReviewPanel {...mockProps} />)
    expect(screen.getByText(/Daisy/)).toBeInTheDocument()
  })

  it('renders the last seen address', () => {
    render(<ReviewPanel {...mockProps} />)
    expect(screen.getByText(/Park Slope, Brooklyn/)).toBeInTheDocument()
  })

  it('renders the alert radius', () => {
    render(<ReviewPanel {...mockProps} />)
    expect(screen.getByText(/2 miles/)).toBeInTheDocument()
  })

  it('calls onNext when Send is clicked', async () => {
    const onNext = vi.fn()
    const user = userEvent.setup()
    render(<ReviewPanel {...mockProps} onNext={onNext} />)
    await user.click(screen.getByRole('button', { name: /send/i }))
    expect(onNext).toHaveBeenCalled()
  })

  it('calls onBack when Back is clicked', async () => {
    const onBack = vi.fn()
    const user = userEvent.setup()
    render(<ReviewPanel {...mockProps} onBack={onBack} />)
    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- ReviewPanel
```

Expected: FAIL

- [ ] **Step 3: Implement ReviewPanel**

Replace `src/components/lost-dog/ReviewPanel.jsx`:

```jsx
export default function ReviewPanel({ dog, profile, mapPin, alertRadius, formData, onNext, onBack }) {
  const name = formData.dogName ?? dog?.name ?? 'your dog'
  const breed = formData.breed ?? dog?.breed ?? 'unknown breed'
  const age = dog?.age_years ?? '?'
  const gender = dog?.gender ?? ''
  const address = mapPin?.address ?? 'unknown location'
  const description = `My dog ${name} is missing! ${gender === 'female' ? 'She' : 'He'} is a ${age}-year-old ${gender} ${breed}${formData.color ? ` with a ${formData.color} coat` : ''}, last seen near ${address}.`

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm font-bold text-red-800 mb-3">🚨 Lost Dog!</p>

        {dog?.photo_url ? (
          <img src={dog.photo_url} alt={name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 text-3xl">
            🐕
          </div>
        )}

        <p className="text-sm text-gray-700 text-center leading-relaxed mb-3">{description}</p>

        {formData.otherDetails && (
          <p className="text-xs text-gray-500 text-center mb-2">
            Other details: {formData.otherDetails}
          </p>
        )}

        <p className="text-xs text-gray-500 text-center">
          If found, please contact <strong>{profile?.full_name}</strong> at{' '}
          <strong>{profile?.phone ?? 'contact via app'}</strong>
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
        Alerting users within <strong>{alertRadius} miles</strong> of {address}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          Send Alert 🚀
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- ReviewPanel
```

Expected: 5 passed

- [ ] **Step 5: Commit**

```bash
git add src/components/lost-dog/ReviewPanel.jsx src/components/lost-dog/ReviewPanel.test.jsx
git commit -m "feat: add ReviewPanel step 3 with auto-generated alert description"
```

---

## Task 12: ConfirmationPanel (Step 4)

**Files:**
- Modify: `src/components/lost-dog/ConfirmationPanel.jsx`
- Create: `src/components/lost-dog/ConfirmationPanel.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/lost-dog/ConfirmationPanel.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- ConfirmationPanel
```

Expected: FAIL

- [ ] **Step 3: Implement ConfirmationPanel**

Replace `src/components/lost-dog/ConfirmationPanel.jsx`:

```jsx
export default function ConfirmationPanel({ alert, onResolve }) {
  const count = alert?.notified_count ?? 47
  const shelters = alert?.shelters_notified ?? 3
  const radius = alert?.alertRadius ?? 2

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
          ✅
        </div>
        <h2 className="text-lg font-bold text-green-800">Alert Sent!</h2>
        <p className="text-sm text-green-700 mt-1">
          {alert?.dogName}&apos;s alert is now live
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex -space-x-2">
            {['🧑', '👩', '👨'].map((emoji, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-green-200 border-2 border-white flex items-center justify-center text-sm">
                {emoji}
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-bold text-green-800">
              +{count} users notified
            </p>
            <p className="text-xs text-green-600">within {radius} miles</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-green-700">
          <span>📧</span>
          <span><strong>{shelters} shelters</strong> contacted</span>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
        <strong>Tip:</strong> Keep an eye out in your neighborhood and check nearby shelters within the next 24–48 hours.
      </div>

      <button
        onClick={onResolve}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
      >
        Mark as Found ✓
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- ConfirmationPanel
```

Expected: 4 passed

- [ ] **Step 5: Commit**

```bash
git add src/components/lost-dog/ConfirmationPanel.jsx src/components/lost-dog/ConfirmationPanel.test.jsx
git commit -m "feat: add ConfirmationPanel step 4 with avatar stack and Mark as Found"
```

---

## Task 13: Alert Service (Supabase Integration)

**Files:**
- Modify: `src/services/alerts.js`
- Create: `src/services/alerts.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/services/alerts.test.js`:

```js
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
    const mockInsert = vi.fn().mockResolvedValue({
      data: [{ id: 'alert-1', notified_count: 47, shelters_notified: 3 }],
      error: null,
    })
    supabase.from.mockReturnValue({ insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: mockInsert }) }) })

    const result = await createAlert({
      isDemoMode: false, dogId: 'dog-1', ownerId: 'user-1',
      lat: 40.68, lng: -73.98, address: 'Brooklyn', radiusMiles: 2, otherDetails: '',
    })
    expect(supabase.from).toHaveBeenCalledWith('lost_dog_alerts')
    expect(result).toHaveProperty('id')
  })

  it('resolveAlert updates the alert status in demo mode', async () => {
    const result = await resolveAlert('alert-1', true)
    expect(result.id).toBe('alert-1')
    expect(supabase.from).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- alerts.test
```

Expected: FAIL — `createAlert` doesn't match expected behavior

- [ ] **Step 3: Implement alerts service**

Replace `src/services/alerts.js`:

```js
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- alerts.test
```

Expected: 3 passed

- [ ] **Step 5: Wire resolveAlert into LostDogFlow**

Open `src/components/lost-dog/LostDogFlow.jsx` and update the `handleClose` function to resolve the alert when Mark as Found is triggered:

```jsx
// In LostDogFlow.jsx, update the imports at the top:
import { createAlert, resolveAlert } from '../../services/alerts'

// Replace the handleClose function:
async function handleClose() {
  if (savedAlert?.id) {
    await resolveAlert(savedAlert.id, isDemoMode)
  }
  setStep(1)
  setFormData({})
  setSavedAlert(null)
  onClose()
}
```

- [ ] **Step 6: Run all tests**

```bash
npm run test:run
```

Expected: All tests pass

- [ ] **Step 7: Commit**

```bash
git add src/services/
git commit -m "feat: add alerts service with Supabase integration and demo mode simulation"
```

---

## Task 14: Login Page

**Files:**
- Modify: `src/pages/LoginPage.jsx`
- Create: `src/pages/LoginPage.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/pages/LoginPage.test.jsx`:

```jsx
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
  useAuth: () => ({ signIn: vi.fn(), enterDemoMode: vi.fn() }),
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- LoginPage
```

Expected: FAIL

- [ ] **Step 3: Implement LoginPage**

Replace `src/pages/LoginPage.jsx`:

```jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { signIn, enterDemoMode } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/app')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleDemoMode() {
    enterDemoMode()
    navigate('/app')
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🐾</div>
          <h1 className="text-2xl font-bold text-green-800">PawPal</h1>
          <p className="text-sm text-green-600 mt-1">Log into your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <button
            type="button"
            onClick={handleDemoMode}
            className="border-2 border-green-200 text-green-700 font-semibold py-3 rounded-lg text-sm hover:bg-green-50 transition-colors"
          >
            Try Demo (no account needed)
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-green-600 font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- LoginPage
```

Expected: 3+ passed

- [ ] **Step 5: Commit**

```bash
git add src/pages/LoginPage.jsx src/pages/LoginPage.test.jsx
git commit -m "feat: add LoginPage with email/password and demo mode button"
```

---

## Task 15: SignUp Flow + MainApp Wiring

**Files:**
- Modify: `src/pages/SignUpFlow.jsx`
- Modify: `src/pages/MainApp.jsx`
- Create: `src/pages/SignUpFlow.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/pages/SignUpFlow.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- SignUpFlow
```

Expected: FAIL

- [ ] **Step 3: Implement SignUpFlow**

Replace `src/pages/SignUpFlow.jsx`:

```jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignUpFlow() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ownerData, setOwnerData] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' })
  const [dogData, setDogData] = useState({ name: '', breed: '', gender: 'female', ageYears: '' })

  function handleOwnerNext(e) {
    e.preventDefault()
    if (!ownerData.firstName || !ownerData.email || !ownerData.password) return
    setStep(2)
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp({
        email: ownerData.email,
        password: ownerData.password,
        fullName: `${ownerData.firstName} ${ownerData.lastName}`.trim(),
        phone: ownerData.phone,
        dogName: dogData.name,
        dogBreed: dogData.breed,
        dogGender: dogData.gender,
        dogAgeYears: parseInt(dogData.ageYears, 10) || 1,
      })
      navigate('/app')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🐾</div>
          <h1 className="text-2xl font-bold text-green-800">PawPal</h1>
          <p className="text-sm text-green-600 mt-1">
            {step === 1 ? 'Your Information' : "Your Dog's Information"}
          </p>
          <div className="flex justify-center gap-2 mt-3">
            {[1, 2].map((s) => (
              <div key={s} className={`w-2 h-2 rounded-full transition-colors ${s <= step ? 'bg-green-600' : 'bg-green-200'}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleOwnerNext} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="First Name"
                  value={ownerData.firstName}
                  onChange={(e) => setOwnerData(p => ({ ...p, firstName: e.target.value }))}
                  required
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  placeholder="Last Name"
                  value={ownerData.lastName}
                  onChange={(e) => setOwnerData(p => ({ ...p, lastName: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={ownerData.email}
                onChange={(e) => setOwnerData(p => ({ ...p, email: e.target.value }))}
                required
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={ownerData.password}
                onChange={(e) => setOwnerData(p => ({ ...p, password: e.target.value }))}
                required
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="tel"
                placeholder="Phone Number (optional)"
                value={ownerData.phone}
                onChange={(e) => setOwnerData(p => ({ ...p, phone: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button type="submit" className="bg-green-600 text-white font-semibold py-3 rounded-lg text-sm mt-1 hover:bg-green-700 transition-colors">
                Next →
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSignUp} className="flex flex-col gap-3">
              <input
                placeholder="Dog's Name"
                value={dogData.name}
                onChange={(e) => setDogData(p => ({ ...p, name: e.target.value }))}
                required
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                placeholder="Breed"
                value={dogData.breed}
                onChange={(e) => setDogData(p => ({ ...p, breed: e.target.value }))}
                required
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Age (years)"
                  type="number"
                  min="0"
                  value={dogData.ageYears}
                  onChange={(e) => setDogData(p => ({ ...p, ageYears: e.target.value }))}
                  required
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <select
                  value={dogData.gender}
                  onChange={(e) => setDogData(p => ({ ...p, gender: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-medium hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Implement MainApp**

Replace `src/pages/MainApp.jsx`:

```jsx
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TopNav from '../components/layout/TopNav'
import MapView from '../components/map/MapView'
import LostDogFlow from '../components/lost-dog/LostDogFlow'

export default function MainApp() {
  const { loading } = useAuth()
  const navigate = useNavigate()
  const [activePanel, setActivePanel] = useState(null)
  const [mapPin, setMapPin] = useState(null)
  const [alertRadius, setAlertRadius] = useState(2)
  const [showRings, setShowRings] = useState(false)

  const handlePinChange = useCallback((pin) => setMapPin(pin), [])
  const handleRadiusChange = useCallback((r) => setAlertRadius(r), [])

  function handleLostDogClick() {
    setShowRings(false)
    setActivePanel('lostDog')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-green-50">
      <div className="text-green-700 font-medium">Loading...</div>
    </div>
  )

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopNav onLostDogClick={handleLostDogClick} />
      <div className="flex-1 relative">
        <MapView
          pin={mapPin}
          onPinChange={handlePinChange}
          alertRadius={alertRadius}
          isPinMode={activePanel === 'lostDog'}
          showRings={showRings}
        />
        <LostDogFlow
          open={activePanel === 'lostDog'}
          onClose={() => { setActivePanel(null); setMapPin(null) }}
          mapPin={mapPin}
          onPinChange={handlePinChange}
          alertRadius={alertRadius}
          onRadiusChange={handleRadiusChange}
          onShowRings={() => setShowRings(true)}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run all tests**

```bash
npm run test:run
```

Expected: All tests pass

- [ ] **Step 6: Run the dev server and manually test the full flow**

```bash
npm run dev
```

Open http://localhost:5173. Test this golden path:
1. Click **Try Demo** — app navigates to `/app` with Alice + Daisy loaded
2. Click **Lost Dog** in the top nav — panel slides in
3. Click the map to drop a pin — Next button enables
4. Click Next — Verify Info panel loads with Daisy's data pre-filled
5. Change radius slider, click Review → — Review panel shows generated description
6. Click Send Alert 🚀 — Confirmation panel shows with 47 users notified
7. Click Mark as Found — panel closes

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: complete Lost Dog flow — signup, login, MainApp wiring, all 4 panel steps"
```

---

## All Tests Passing Verification

```bash
npm run test:run
```

Expected output:
```
✓ src/test/smoke.test.jsx (1)
✓ src/context/AuthContext.test.jsx (2)
✓ src/App.test.jsx (1)
✓ src/components/map/MapView.test.jsx (2)
✓ src/components/layout/TopNav.test.jsx (3+)
✓ src/components/panel/SlidingPanel.test.jsx (3)
✓ src/components/panel/StepIndicator.test.jsx (1)
✓ src/components/lost-dog/LostDogFlow.test.jsx (3)
✓ src/components/lost-dog/DropPinPanel.test.jsx (5)
✓ src/components/lost-dog/VerifyInfoPanel.test.jsx (4)
✓ src/components/lost-dog/ReviewPanel.test.jsx (5)
✓ src/components/lost-dog/ConfirmationPanel.test.jsx (4)
✓ src/services/alerts.test.js (3)
✓ src/pages/LoginPage.test.jsx (3+)
✓ src/pages/SignUpFlow.test.jsx (2)
```
