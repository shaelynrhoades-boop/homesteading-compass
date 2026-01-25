-- Enable RLS and add user-only policies (update table names/columns to match your schema).

-- Profiles example (assumes profiles.id = auth.uid()).
alter table public.profiles enable row level security;
create policy "Profiles are viewable by owner"
on public.profiles
for select
using (auth.uid() = id);
create policy "Profiles are editable by owner"
on public.profiles
for update
using (auth.uid() = id);
create policy "Profiles can be inserted by owner"
on public.profiles
for insert
with check (auth.uid() = id);

-- Logs example (assumes logs.user_id = auth.uid()).
alter table public.logs enable row level security;
create policy "Logs are viewable by owner"
on public.logs
for select
using (auth.uid() = user_id);
create policy "Logs can be inserted by owner"
on public.logs
for insert
with check (auth.uid() = user_id);
create policy "Logs are editable by owner"
on public.logs
for update
using (auth.uid() = user_id);
create policy "Logs are deletable by owner"
on public.logs
for delete
using (auth.uid() = user_id);

-- Support messages (in-app messaging).
create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  email text,
  subject text,
  message text not null,
  status text default 'Received',
  admin_reply text,
  admin_reply_at timestamptz,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.support_messages enable row level security;
create policy "Support messages are insertable by owner"
on public.support_messages
for insert
with check (auth.uid() = user_id);
create policy "Support messages are viewable by owner"
on public.support_messages
for select
using (auth.uid() = user_id);

-- Optional: allow admin (by email) to update replies/status.
-- Replace YOU@EXAMPLE.COM with your admin email.
create policy "Support messages are updatable by admin email"
on public.support_messages
for update
using ((auth.jwt() ->> 'email') = 'YOU@EXAMPLE.COM');

-- Storage policies for bucket: support-attachments
create policy "Support attachments are insertable by owner"
on storage.objects
for insert
with check (bucket_id = 'support-attachments' and auth.uid() = owner);
create policy "Support attachments are viewable by owner"
on storage.objects
for select
using (bucket_id = 'support-attachments' and auth.uid() = owner);
