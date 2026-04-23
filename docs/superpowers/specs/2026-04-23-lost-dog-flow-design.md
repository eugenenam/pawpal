# PawPal — Lost Dog Flow Design Spec

**Date:** 2026-04-23
**Scope:** MVP prototype — Lost Dog flow only. Profile, Dog Care, and Places are future iterations.

---

## Overview

PawPal is a web app that lets dog owners create a geo-targeted "amber alert" for a lost dog, notifying nearby users, shelters, and animal hospitals simultaneously. This spec covers the first buildable slice: the Lost Dog flow.

---

## Decisions

| Decision | Choice |
|---|---|
| Platform | Responsive web app |
| Prototype type | Hybrid — real map + real auth/data, simulated notifications |
| Design direction | Fresh & Warm — green palette, approachable, community-focused |
| App architecture | Map-centric with sliding panels |
| Authentication | Real Supabase auth + "Try Demo" bypass button |
| Notification simulation | Confirmation panel with avatar stack + notified count |

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Maps | Mapbox GL JS |
| Backend / Auth / DB | Supabase (PostgreSQL + Auth + Storage + Realtime) |

---

## Architecture

The app is a single-page React application. The Mapbox map fills the full browser window and **never unmounts**. All navigation happens through panels that slide in from the right side over the map.

The top navigation bar contains:
- PawPal logo (left)
- Nav links: Profile, Lost Dog, Places (center)
- Try Demo button + Log In link (right)

The map remains interactive behind any open panel. Closing a panel returns to the full-width map view.

---

## Lost Dog Flow — 4 Panel States

The entire Lost Dog flow lives inside a single sliding panel. A step indicator (e.g. "Step 2 of 3") shows progress.

### Panel 1 — Drop a Pin
- Instruction text: "Tap the map to drop a pin at [Dog's name]'s last known location"
- Map is fully interactive — user taps/clicks to place or reposition pin
- Reverse geocoding converts lat/lng to a human-readable address shown below the map
- "Next →" button advances to Panel 2

### Panel 2 — Verify Info
- Dog photo and name pre-filled from the dog profile
- Editable fields: name, breed, color, age, gender, weight (all pre-filled)
- Alert radius slider: 0.5 mi / 1 mi / 2 mi / 5 mi (default: 2 mi)
- Radius circle on the map updates live as slider moves
- Optional free-text field: "Any other details?" (identifying marks, collar color, etc.)
- "Review →" button advances to Panel 3

### Panel 3 — Review & Send
- Renders a preview of the alert as it will appear to nearby users:
  - Dog photo
  - Auto-generated description: "My dog [Name] is missing. She is a [age]yr [gender] [breed] last seen near [address]."
  - Other details (if provided)
  - Owner contact info
- "← Edit" returns to Panel 2
- "Send 🚀" submits the alert and advances to Panel 4

### Panel 4 — Confirmation
- Panel background changes to a lighter green
- Header: "✅ Alert Sent!"
- Map shows animated concentric rings pulsing outward from the pin
- Avatar stack (3 avatars + "+X others") showing simulated notified users
- "X users notified within Y miles" — X is seeded realistically (~47)
- "📧 X shelters contacted" — seeded (3)
- "Mark as Found" button sets alert status to `resolved` and dismisses the panel

---

## Authentication

### Real Auth Flow
- Log In screen: email + password, "Forgot password?" link
- Sign Up: 2 steps
  - Step 1: First name, last name, email, password, phone (optional)
  - Step 2: Dog name, breed, birthday, gender, photo upload

### Demo Mode
- "Try Demo" button on the nav bar (and on the login screen)
- Loads a pre-seeded Supabase account: "Anxious Alice" with dog "Daisy" (Beagle, 3yr, Female)
- Bypasses all auth — drops user directly into the Lost Dog flow with Daisy's profile pre-loaded
- Demo session is read-only for the seeded data but can create real alerts

---

## Data Model (Supabase)

### `profiles`
Extends Supabase `auth.users`. Created automatically on signup via a Postgres trigger.

| Column | Type | Notes |
|---|---|---|
| id | uuid | matches `auth.users.id` |
| full_name | text | |
| phone | text | nullable |
| created_at | timestamp | |

### `dogs`
One dog per user for MVP. Expandable to multi-dog in a future iteration.

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| owner_id | uuid | fk → profiles.id |
| name | text | |
| breed | text | |
| color | text | |
| age_years | int | |
| gender | text | male / female |
| weight_lbs | int | nullable |
| microchip_number | text | nullable |
| photo_url | text | Supabase Storage URL |
| created_at | timestamp | |

### `lost_dog_alerts`
Core table. One row per alert event.

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| dog_id | uuid | fk → dogs.id |
| owner_id | uuid | fk → profiles.id |
| status | text | active / resolved |
| last_seen_lat | float8 | from map pin |
| last_seen_lng | float8 | from map pin |
| last_seen_address | text | reverse geocoded from Mapbox |
| alert_radius_miles | float4 | default 2 |
| other_details | text | nullable |
| notified_count | int | simulated — seeded randomly 40–60 at alert creation |
| shelters_notified | int | simulated — seeded 3 |
| created_at | timestamp | |
| resolved_at | timestamp | nullable — set on "Mark as Found" |

---

## Notification Simulation

No real push notification infrastructure exists in this prototype. The simulation works as follows:

- `notified_count` is seeded with a realistic value (40–60) when the alert is created
- `shelters_notified` is seeded with 3
- The confirmation panel reads these values and displays them as if they were live
- The map shows animated concentric ring pulses using CSS/Mapbox animations
- Future iteration: replace seeded values with real Supabase Realtime subscriptions

---

## Out of Scope (Future Iterations)

- Profile screen (view/edit dog profile)
- Dog Care section (grooming, nutrition, exercise, training)
- Places section (dog parks, shelters map, dog-friendly restaurants)
- Friends feature (dog social network)
- Real push notifications to nearby users
- Multi-dog support
- Social login (Facebook, Google)
