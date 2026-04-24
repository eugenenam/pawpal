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
  notified_count integer not null default 0,
  shelters_notified integer not null default 0,
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

-- Owners can delete their own alerts (e.g., accidental submissions).
-- Cascades to related records via the dog_id FK above.
create policy "Users can delete own alerts"
  on public.lost_dog_alerts for delete
  using (auth.uid() = owner_id);
