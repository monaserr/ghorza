
insert into storage.buckets (id, name, public) values ('products', 'products', true)
on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects for select using (bucket_id = 'products');
create policy "product_images_admin_write" on storage.objects for insert with check (bucket_id = 'products' and public.has_role(auth.uid(), 'admin'));
create policy "product_images_admin_update" on storage.objects for update using (bucket_id = 'products' and public.has_role(auth.uid(), 'admin'));
create policy "product_images_admin_delete" on storage.objects for delete using (bucket_id = 'products' and public.has_role(auth.uid(), 'admin'));
