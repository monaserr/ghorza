-- Contact messages table
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Anyone can insert (public form)
create policy "contact_insert_public" on public.contact_messages
  for insert with check (true);

-- Only admins can read
create policy "contact_select_admin" on public.contact_messages
  for select using (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for product images (run this in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
-- CREATE POLICY "products_storage_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'products');
-- CREATE POLICY "products_storage_admin_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND public.has_role(auth.uid(), 'admin'));
