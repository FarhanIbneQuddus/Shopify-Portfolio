/*
# Create contact_messages table (single-tenant, no auth)

1. New Tables
- `contact_messages`
  - `id` (uuid, primary key)
  - `name` (text, not null) — sender's name
  - `email` (text, not null) — sender's email for replies
  - `message` (text, not null) — the message body
  - `created_at` (timestamptz, defaults to now())
2. Security
- Enable RLS on `contact_messages`.
- Allow anon + authenticated INSERT only (public visitors can submit the contact form).
- No SELECT/UPDATE/DELETE for anon — only inserts are public; reads are restricted to authenticated (the owner).
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_contact_messages" ON contact_messages;
CREATE POLICY "anon_insert_contact_messages" ON contact_messages FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authed_read_contact_messages" ON contact_messages;
CREATE POLICY "authed_read_contact_messages" ON contact_messages FOR SELECT
TO authenticated USING (true);