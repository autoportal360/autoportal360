-- ─── Admin users table — adds role columns if not already present ─────────────
alter table admin_users add column if not exists name        text;
alter table admin_users add column if not exists role        text not null default 'editor';
alter table admin_users add column if not exists is_active   boolean default true;
alter table admin_users add column if not exists last_login  timestamptz;
alter table admin_users disable row level security;

-- Add check constraint on role (safe: uses IF NOT EXISTS equivalent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'admin_users_role_check'
  ) THEN
    ALTER TABLE admin_users
      ADD CONSTRAINT admin_users_role_check
      CHECK (role IN ('super_admin', 'catalogue', 'editor', 'seo'));
  END IF;
END$$;

-- Insert or promote the super admin
INSERT INTO admin_users (email, name, role, is_active)
VALUES ('autoportal360@gmail.com', 'AutoPortal360 Admin', 'super_admin', true)
ON CONFLICT (email) DO UPDATE
  SET role      = 'super_admin',
      is_active = true,
      name      = COALESCE(EXCLUDED.name, admin_users.name);
