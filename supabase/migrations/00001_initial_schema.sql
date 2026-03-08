-- ============================================================
-- Trigger function: set_updated_at
-- ============================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- Tables
-- ============================================================

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table trips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_image text,
  destination text,
  start_date date,
  end_date date,
  budget_cents bigint default 0,
  currency text default 'USD',
  created_by uuid references profiles,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table trip_members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips not null,
  user_id uuid references profiles not null,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (trip_id, user_id)
);

create table trip_invitations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips not null,
  invited_email text not null,
  role text not null check (role in ('editor', 'viewer')),
  status text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  token uuid default gen_random_uuid() unique,
  invited_by uuid references profiles,
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table itinerary_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips not null,
  date date not null,
  title text,
  notes text,
  position int not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (trip_id, date)
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  day_id uuid references itinerary_days on delete cascade,
  trip_id uuid references trips not null,
  title text not null,
  description text,
  location text,
  time_start time,
  time_end time,
  category text,
  notes text,
  cost_cents bigint default 0,
  position int not null,
  created_by uuid references profiles,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips not null,
  target_type text not null check (target_type in ('day', 'activity')),
  target_id uuid not null,
  body text not null,
  author_id uuid references profiles,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table checklists (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips not null,
  title text not null,
  type text default 'custom' check (type in ('packing', 'todo', 'custom')),
  position int not null default 0,
  created_by uuid references profiles,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid references checklists on delete cascade not null,
  trip_id uuid references trips not null,
  label text not null,
  is_checked boolean default false,
  assigned_to uuid references profiles,
  position int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips not null,
  type text not null check (type in ('hotel', 'flight', 'restaurant', 'car', 'train', 'other')),
  title text not null,
  confirmation_code text,
  provider text,
  location text,
  start_datetime timestamptz,
  end_datetime timestamptz,
  cost_cents bigint default 0,
  notes text,
  created_by uuid references profiles,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips not null,
  title text not null,
  amount_cents bigint not null,
  currency text default 'USD',
  category text,
  paid_by uuid references profiles,
  date date,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table attachments (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips not null,
  target_type text,
  target_id uuid,
  file_name text not null,
  file_url text not null,
  file_size bigint,
  mime_type text,
  uploaded_by uuid references profiles,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index idx_trip_members_trip_id on trip_members (trip_id);
create index idx_trip_members_user_id on trip_members (user_id);
create index idx_activities_day_id on activities (day_id);
create index idx_activities_trip_id on activities (trip_id);
create index idx_comments_trip_id on comments (trip_id);
create index idx_comments_target_id on comments (target_id);
create index idx_checklist_items_checklist_id on checklist_items (checklist_id);
create index idx_expenses_trip_id on expenses (trip_id);
create index idx_reservations_trip_id on reservations (trip_id);
create index idx_attachments_trip_id on attachments (trip_id);

-- ============================================================
-- Updated_at triggers
-- ============================================================

create trigger set_profiles_updated_at before update on profiles for each row execute function set_updated_at();
create trigger set_trips_updated_at before update on trips for each row execute function set_updated_at();
create trigger set_trip_members_updated_at before update on trip_members for each row execute function set_updated_at();
create trigger set_trip_invitations_updated_at before update on trip_invitations for each row execute function set_updated_at();
create trigger set_itinerary_days_updated_at before update on itinerary_days for each row execute function set_updated_at();
create trigger set_activities_updated_at before update on activities for each row execute function set_updated_at();
create trigger set_comments_updated_at before update on comments for each row execute function set_updated_at();
create trigger set_checklists_updated_at before update on checklists for each row execute function set_updated_at();
create trigger set_checklist_items_updated_at before update on checklist_items for each row execute function set_updated_at();
create trigger set_reservations_updated_at before update on reservations for each row execute function set_updated_at();
create trigger set_expenses_updated_at before update on expenses for each row execute function set_updated_at();
create trigger set_attachments_updated_at before update on attachments for each row execute function set_updated_at();

-- ============================================================
-- Functions: auth triggers
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Functions: trip triggers
-- ============================================================

create or replace function add_trip_owner()
returns trigger as $$
begin
  insert into trip_members (trip_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_trip_created_add_owner
  after insert on trips
  for each row execute function add_trip_owner();

create or replace function scaffold_trip_days()
returns trigger as $$
declare
  d date;
  pos int := 0;
begin
  if new.start_date is not null and new.end_date is not null then
    for d in select generate_series(new.start_date, new.end_date, '1 day'::interval)::date
    loop
      insert into itinerary_days (trip_id, date, position)
      values (new.id, d, pos);
      pos := pos + 1;
    end loop;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_trip_created_scaffold_days
  after insert on trips
  for each row execute function scaffold_trip_days();

-- ============================================================
-- Helper functions
-- ============================================================

create or replace function is_trip_member(trip uuid, "user" uuid)
returns boolean as $$
  select exists (
    select 1 from trip_members
    where trip_id = trip and user_id = "user"
  );
$$ language sql security definer stable;

create or replace function is_trip_editor_or_owner(trip uuid, "user" uuid)
returns boolean as $$
  select exists (
    select 1 from trip_members
    where trip_id = trip and user_id = "user" and role in ('owner', 'editor')
  );
$$ language sql security definer stable;

create or replace function is_trip_owner(trip uuid, "user" uuid)
returns boolean as $$
  select exists (
    select 1 from trip_members
    where trip_id = trip and user_id = "user" and role = 'owner'
  );
$$ language sql security definer stable;

-- ============================================================
-- RPC: accept_invitation
-- ============================================================

create or replace function accept_invitation(invite_token uuid)
returns void as $$
declare
  inv record;
begin
  select * into inv
  from trip_invitations
  where token = invite_token
    and status = 'pending'
    and expires_at > now();

  if not found then
    raise exception 'Invalid or expired invitation';
  end if;

  update trip_invitations
  set status = 'accepted', updated_at = now()
  where id = inv.id;

  insert into trip_members (trip_id, user_id, role)
  values (inv.trip_id, auth.uid(), inv.role)
  on conflict (trip_id, user_id) do nothing;
end;
$$ language plpgsql security definer;

-- ============================================================
-- View: budget_summary
-- ============================================================

create view budget_summary as
select trip_id, category, sum(amount_cents) as total_cents, count(*) as count
from expenses where deleted_at is null
group by trip_id, category;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table trips enable row level security;
alter table trip_members enable row level security;
alter table trip_invitations enable row level security;
alter table itinerary_days enable row level security;
alter table activities enable row level security;
alter table comments enable row level security;
alter table checklists enable row level security;
alter table checklist_items enable row level security;
alter table reservations enable row level security;
alter table expenses enable row level security;
alter table attachments enable row level security;

-- profiles
create policy "profiles_select" on profiles for select to authenticated using (true);
create policy "profiles_update" on profiles for update to authenticated using (id = auth.uid());

-- trips
create policy "trips_select" on trips for select to authenticated
  using (is_trip_member(id, auth.uid()) and deleted_at is null);
create policy "trips_insert" on trips for insert to authenticated
  with check (true);
create policy "trips_update" on trips for update to authenticated
  using (is_trip_owner(id, auth.uid()));
create policy "trips_delete" on trips for delete to authenticated
  using (is_trip_owner(id, auth.uid()));

-- trip_members
create policy "trip_members_select" on trip_members for select to authenticated
  using (is_trip_member(trip_id, auth.uid()));
create policy "trip_members_insert" on trip_members for insert to authenticated
  with check (is_trip_owner(trip_id, auth.uid()));
create policy "trip_members_update" on trip_members for update to authenticated
  using (is_trip_owner(trip_id, auth.uid()));
create policy "trip_members_delete" on trip_members for delete to authenticated
  using (is_trip_owner(trip_id, auth.uid()));

-- trip_invitations
create policy "trip_invitations_select" on trip_invitations for select to authenticated
  using (is_trip_member(trip_id, auth.uid()));
create policy "trip_invitations_insert" on trip_invitations for insert to authenticated
  with check (is_trip_editor_or_owner(trip_id, auth.uid()));
create policy "trip_invitations_update" on trip_invitations for update to authenticated
  using (invited_email = (select email from profiles where id = auth.uid()));

-- itinerary_days
create policy "itinerary_days_select" on itinerary_days for select to authenticated
  using (is_trip_member(trip_id, auth.uid()));
create policy "itinerary_days_insert" on itinerary_days for insert to authenticated
  with check (is_trip_editor_or_owner(trip_id, auth.uid()));
create policy "itinerary_days_update" on itinerary_days for update to authenticated
  using (is_trip_editor_or_owner(trip_id, auth.uid()));
create policy "itinerary_days_delete" on itinerary_days for delete to authenticated
  using (is_trip_editor_or_owner(trip_id, auth.uid()));

-- activities
create policy "activities_select" on activities for select to authenticated
  using (is_trip_member(trip_id, auth.uid()) and deleted_at is null);
create policy "activities_insert" on activities for insert to authenticated
  with check (is_trip_editor_or_owner(trip_id, auth.uid()));
create policy "activities_update" on activities for update to authenticated
  using (is_trip_editor_or_owner(trip_id, auth.uid()) and deleted_at is null);
create policy "activities_delete" on activities for delete to authenticated
  using (is_trip_editor_or_owner(trip_id, auth.uid()));

-- comments
create policy "comments_select" on comments for select to authenticated
  using (is_trip_member(trip_id, auth.uid()));
create policy "comments_insert" on comments for insert to authenticated
  with check (is_trip_member(trip_id, auth.uid()));
create policy "comments_update" on comments for update to authenticated
  using (author_id = auth.uid());
create policy "comments_delete" on comments for delete to authenticated
  using (author_id = auth.uid());

-- checklists
create policy "checklists_select" on checklists for select to authenticated
  using (is_trip_member(trip_id, auth.uid()));
create policy "checklists_insert" on checklists for insert to authenticated
  with check (is_trip_editor_or_owner(trip_id, auth.uid()));
create policy "checklists_update" on checklists for update to authenticated
  using (is_trip_editor_or_owner(trip_id, auth.uid()));
create policy "checklists_delete" on checklists for delete to authenticated
  using (is_trip_editor_or_owner(trip_id, auth.uid()));

-- checklist_items
create policy "checklist_items_select" on checklist_items for select to authenticated
  using (is_trip_member(trip_id, auth.uid()));
create policy "checklist_items_insert" on checklist_items for insert to authenticated
  with check (is_trip_editor_or_owner(trip_id, auth.uid()));
create policy "checklist_items_update" on checklist_items for update to authenticated
  using (is_trip_editor_or_owner(trip_id, auth.uid()));
create policy "checklist_items_delete" on checklist_items for delete to authenticated
  using (is_trip_editor_or_owner(trip_id, auth.uid()));

-- reservations
create policy "reservations_select" on reservations for select to authenticated
  using (is_trip_member(trip_id, auth.uid()));
create policy "reservations_insert" on reservations for insert to authenticated
  with check (is_trip_editor_or_owner(trip_id, auth.uid()));
create policy "reservations_update" on reservations for update to authenticated
  using (is_trip_editor_or_owner(trip_id, auth.uid()));
create policy "reservations_delete" on reservations for delete to authenticated
  using (is_trip_editor_or_owner(trip_id, auth.uid()));

-- expenses
create policy "expenses_select" on expenses for select to authenticated
  using (is_trip_member(trip_id, auth.uid()));
create policy "expenses_insert" on expenses for insert to authenticated
  with check (is_trip_editor_or_owner(trip_id, auth.uid()));
create policy "expenses_update" on expenses for update to authenticated
  using (is_trip_editor_or_owner(trip_id, auth.uid()));
create policy "expenses_delete" on expenses for delete to authenticated
  using (is_trip_editor_or_owner(trip_id, auth.uid()));

-- attachments
create policy "attachments_select" on attachments for select to authenticated
  using (is_trip_member(trip_id, auth.uid()));
create policy "attachments_insert" on attachments for insert to authenticated
  with check (is_trip_editor_or_owner(trip_id, auth.uid()));
create policy "attachments_delete" on attachments for delete to authenticated
  using (is_trip_editor_or_owner(trip_id, auth.uid()));

-- ============================================================
-- Realtime
-- ============================================================

alter publication supabase_realtime add table activities;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table checklist_items;
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table trip_members;
