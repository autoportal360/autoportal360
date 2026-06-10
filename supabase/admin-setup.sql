create table if not exists admin_users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now()
);

alter table admin_users disable row level security;
