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
