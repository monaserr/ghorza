
-- ============ ROLES ENUM ============
create type public.app_role as enum ('admin', 'customer');

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ============ USER ROLES (separate table to prevent privilege escalation) ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- Security definer function to check roles (avoids recursive RLS)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- ============ COLLECTIONS ============
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.collections enable row level security;

-- ============ PRODUCTS ============
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2),
  image_url text,
  images jsonb not null default '[]'::jsonb,
  category text not null default 'unisex',
  sizes jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  stock int not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
create index idx_products_active on public.products(is_active);
create index idx_products_featured on public.products(is_featured);

-- ============ PRODUCT <-> COLLECTIONS ============
create table public.product_collections (
  product_id uuid not null references public.products(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  primary key (product_id, collection_id)
);
alter table public.product_collections enable row level security;

-- ============ ORDERS ============
create type public.order_status as enum ('pending', 'paid', 'shipped', 'delivered', 'cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('VR-' || to_char(now(),'YYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 6)),
  user_id uuid references auth.users(id) on delete set null,
  status order_status not null default 'pending',
  email text not null,
  full_name text not null,
  phone text,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  postal_code text,
  country text not null default 'EG',
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(status);

-- ============ ORDER ITEMS ============
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_slug text,
  image_url text,
  size text,
  color text,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(10,2) not null,
  created_at timestamptz not null default now()
);
alter table public.order_items enable row level security;

-- ============ UPDATED_AT TRIGGER ============
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_products_updated before update on public.products for each row execute function public.set_updated_at();
create trigger trg_collections_updated before update on public.collections for each row execute function public.set_updated_at();
create trigger trg_orders_updated before update on public.orders for each row execute function public.set_updated_at();

-- ============ AUTO PROFILE + DEFAULT ROLE ON SIGNUP ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''));
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============ RLS POLICIES ============

-- profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_select_admin" on public.profiles for select using (public.has_role(auth.uid(), 'admin'));
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- user_roles
create policy "user_roles_select_own" on public.user_roles for select using (auth.uid() = user_id);
create policy "user_roles_admin_all" on public.user_roles for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- collections (public read)
create policy "collections_select_all" on public.collections for select using (true);
create policy "collections_admin_all" on public.collections for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- products (public read of active; admin sees all)
create policy "products_select_active" on public.products for select using (is_active = true);
create policy "products_admin_select_all" on public.products for select using (public.has_role(auth.uid(), 'admin'));
create policy "products_admin_all" on public.products for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- product_collections
create policy "pc_select_all" on public.product_collections for select using (true);
create policy "pc_admin_all" on public.product_collections for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- orders
create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id);
create policy "orders_select_admin" on public.orders for select using (public.has_role(auth.uid(), 'admin'));
create policy "orders_insert_own_or_guest" on public.orders for insert with check (
  (auth.uid() is null and user_id is null) or (auth.uid() = user_id)
);
create policy "orders_admin_update" on public.orders for update using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- order_items
create policy "oi_select_own" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(), 'admin')))
);
create policy "oi_insert_with_order" on public.order_items for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and ((auth.uid() is null and o.user_id is null) or o.user_id = auth.uid() or public.has_role(auth.uid(), 'admin')))
);
create policy "oi_admin_all" on public.order_items for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
